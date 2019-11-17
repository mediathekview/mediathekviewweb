import { AsyncDisposer, disposeAsync } from '@common-ts/base/disposable';
import { AsyncEnumerable } from '@common-ts/base/enumerable';
import { Logger } from '@common-ts/base/logger';
import { Job, Queue, QueueProvider } from '@common-ts/base/queue';
import { timeout } from '@common-ts/base/utils';
import { CancellationToken } from '@common-ts/base/utils/cancellation-token';
import { Module, ModuleBase, ModuleMetric } from '@common-ts/server/module';
import { Entry } from '../common/models';
import { keys } from '../keys';
import { EntryRepository } from '../repositories/entry-repository';

const BATCH_SIZE = 250;
const BUFFER_SIZE = 3;

export class EntriesSaverModule extends ModuleBase implements Module {
  private readonly entryRepository: EntryRepository;
  private readonly queueProvider: QueueProvider;
  private readonly logger: Logger;

  constructor(entryRepository: EntryRepository, queueProvider: QueueProvider, logger: Logger) {
    super('EntriesSaver');

    this.entryRepository = entryRepository;
    this.queueProvider = queueProvider;
    this.logger = logger;
  }

  getMetrics(): ModuleMetric[] {
    return [];
  }

  protected async _run(_cancellationToken: CancellationToken): Promise<void> {
    const disposer = new AsyncDisposer();

    const entriesToBeSavedQueue = this.queueProvider.get<Entry>(keys.EntriesToBeSaved, 30000);
    const entriesToBeIndexedQueue = this.queueProvider.get<string>(keys.EntriesToBeIndexed, 30000);

    const consumer = entriesToBeSavedQueue.getBatchConsumer(BATCH_SIZE, this.cancellationToken);

    await AsyncEnumerable.from(consumer)
      .buffer(BUFFER_SIZE)
      .forEach(async (batch) => {
        try {
          await this.saveBatch(batch, entriesToBeIndexedQueue);
          await entriesToBeSavedQueue.acknowledge(batch);
        }
        catch (error) {
          this.logger.error(error as Error);
          await timeout(2500);
        }
      });

    await disposer[disposeAsync]();
  }

  private async saveBatch(batch: Job<Entry>[], entriesToBeIndexedQueue: Queue<string>): Promise<void> {
    const entries = batch.map((job) => job.data);
    const ids = entries.map((entry) => entry.id);

    await this.entryRepository.saveMany(entries);
    await entriesToBeIndexedQueue.enqueueMany(ids);
  }
}
