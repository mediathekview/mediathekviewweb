import { Subject } from 'rxjs';
import { AsyncDisposer } from '../common/disposable';
import { AsyncEnumerable } from '../common/enumerable/async-enumerable';
import { Logger } from '../common/logger';
import { Entry } from '../common/model';
import { cancelableTimeout } from '../common/utils';
import { EntrySource } from '../entry-source';
import { keys } from '../keys';
import { Queue, QueueProvider } from '../queue';
import { Service, ServiceMetric, ServiceMetricType } from './service';
import { ServiceBase } from './service-base';

export class EntriesImporterService extends ServiceBase implements Service {
  private readonly queueProvider: QueueProvider;
  private readonly logger: Logger;
  private readonly sources: EntrySource[];

  private imported: number;

  get metrics(): ServiceMetric[] {
    return [{ name: 'imported', type: ServiceMetricType.Counter, value: this.imported }];
  }

  constructor(queueProvider: QueueProvider, logger: Logger, sources: EntrySource[]) {
    super();

    this.queueProvider = queueProvider;
    this.logger = logger;
    this.sources = sources;

    this.imported = 0;
  }

  protected async run(): Promise<void> {
    if (this.sources.length == 0) {
      throw new Error('no source available');
    }

    const disposer = new AsyncDisposer();
    const entriesToBeSavedQueue = this.queueProvider.get<Entry>(keys.EntriesToBeSaved, 30000, 3);

    await this.initializeQueues(disposer, entriesToBeSavedQueue);

    await disposer.defer(async () => {
      const promises = this.sources.map((source) => this.import(source, entriesToBeSavedQueue)); // tslint:disable-line: promise-function-async
      await Promise.all(promises);
    });

    await disposer.dispose();
  }

  private async import(source: EntrySource, entriesToBeSavedQueue: Queue<Entry>): Promise<void> {
    const entries = source.getEntries(this.cancellationToken);

    await AsyncEnumerable.from(entries)
      .retry(false, async (error) => {
        this.logger.error(error);
        await cancelableTimeout(1000, this.cancellationToken);
        return !this.cancellationToken.isSet;
      })
      .forEach(async (batch) => {
        await entriesToBeSavedQueue.enqueueMany(batch);
        this.imported += batch.length;
      });
  }

  private async initializeQueues(disposer: AsyncDisposer, ...queues: Queue<any>[]): Promise<void> {
    for (const queue of queues) {
      await queue.initialize();
      disposer.addDisposeTasks(async () => await queue.dispose());
    }
  }
}
