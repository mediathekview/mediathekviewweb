import { Subject } from 'rxjs';
import { AsyncDisposer } from '../common/disposable';
import { AsyncEnumerable } from '../common/enumerable/async-enumerable';
import { Logger } from '../common/logger';
import { Entry } from '../common/model';
import { timeout } from '../common/utils';
import { keys } from '../keys';
import { Job, Queue, QueueProvider } from '../queue';
import { EntryRepository } from '../repository/entry-repository';
import { Service, ServiceMetric } from './service';
import { ServiceBase } from './service-base';

const BATCH_SIZE = 250;
const BUFFER_SIZE = 3;

export class EntriesSaverService extends ServiceBase implements Service {
  private readonly entryRepository: EntryRepository;
  private readonly queueProvider: QueueProvider;
  private readonly logger: Logger;
  private readonly savedSubject: Subject<number>;

  readonly metrics: ServiceMetric[];

  constructor(entryRepository: EntryRepository, queueProvider: QueueProvider, logger: Logger) {
    super();

    this.entryRepository = entryRepository;
    this.queueProvider = queueProvider;
    this.logger = logger;

    this.savedSubject = new Subject();
    this.metrics = [{ name: 'saved', values: this.savedSubject.asObservable() }];
  }

  protected async run(): Promise<void> {
    const disposer = new AsyncDisposer();

    const entriesToBeSavedQueue = this.queueProvider.get<Entry>(keys.EntriesToBeSaved, 30000, 3);
    const entriesToBeIndexedQueue = this.queueProvider.get<string>(keys.EntriesToBeIndexed, 30000, 3);

    await this.initializeQueues(disposer, entriesToBeSavedQueue, entriesToBeIndexedQueue);

    const consumer = entriesToBeSavedQueue.getBatchConsumer(BATCH_SIZE, this.cancellationToken);

    await AsyncEnumerable.from(consumer)
      .buffer(BUFFER_SIZE)
      .forEach(async (batch) => {
        try {
          await this.saveBatch(batch, entriesToBeIndexedQueue);
          await entriesToBeSavedQueue.acknowledge(...batch);
          this.savedSubject.next(batch.length);
        }
        catch (error) {
          this.logger.error(error as Error);
          await timeout(2500);
        }
      });

    await disposer.dispose();
  }

  private async saveBatch(batch: Job<Entry>[], entriesToBeIndexedQueue: Queue<string>): Promise<void> {
    const entries = batch.map((job) => job.data);
    const ids = entries.map((entry) => entry.id);

    await this.entryRepository.saveMany(entries);
    await entriesToBeIndexedQueue.enqueueMany(ids);
  }

  private async initializeQueues(disposer: AsyncDisposer, ...queues: Queue<any>[]): Promise<void> {
    for (const queue of queues) {
      await queue.initialize();
      disposer.addDisposeTasks(async () => await queue.dispose());
    }
  }
}
