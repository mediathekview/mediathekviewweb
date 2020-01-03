import { AsyncDisposer, disposeAsync } from '@tstdl/base/disposable';
import { AsyncEnumerable } from '@tstdl/base/enumerable';
import { Logger } from '@tstdl/base/logger';
import { Job, Queue } from '@tstdl/base/queue';
import { timeout } from '@tstdl/base/utils';
import { CancellationToken } from '@tstdl/base/utils/cancellation-token';
import { Module, ModuleBase, ModuleMetric } from '@tstdl/server/module';
import { Entry } from '../common/models';
import { EntryRepository } from '../repositories/entry-repository';

const BATCH_SIZE = 250;
const BUFFER_SIZE = 3;

export class EntriesSaverModule extends ModuleBase implements Module {
  private readonly entryRepository: EntryRepository;
  private readonly entriesToBeSavedQueue: Queue<Entry>;
  private readonly entriesToBeIndexedQueue: Queue<string>;
  private readonly logger: Logger;

  constructor(entryRepository: EntryRepository, entriesToBeSavedQueue: Queue<Entry>, entriesToBeIndexedQueue: Queue<string>, logger: Logger) {
    super('EntriesSaver');

    this.entryRepository = entryRepository;
    this.entriesToBeSavedQueue = entriesToBeSavedQueue;
    this.entriesToBeIndexedQueue = entriesToBeIndexedQueue;
    this.logger = logger;
  }

  getMetrics(): ModuleMetric[] {
    return [];
  }

  protected async _run(_cancellationToken: CancellationToken): Promise<void> {
    const disposer = new AsyncDisposer();

    const consumer = this.entriesToBeSavedQueue.getBatchConsumer(BATCH_SIZE, this.cancellationToken);

    await AsyncEnumerable.from(consumer)
      .buffer(BUFFER_SIZE)
      .forEach(async (batch) => {
        try {
          await this.saveBatch(batch);
          await this.entriesToBeSavedQueue.acknowledge(batch);
        }
        catch (error) {
          this.logger.error(error as Error);
          await timeout(2500);
        }
      });

    await disposer[disposeAsync]();
  }

  private async saveBatch(batch: Job<Entry>[]): Promise<void> {
    const entries = batch.map((job) => job.data);
    const ids = entries.map((entry) => entry.id);

    await this.entryRepository.saveMany(entries);
    await this.entriesToBeIndexedQueue.enqueueMany(ids);
  }
}
