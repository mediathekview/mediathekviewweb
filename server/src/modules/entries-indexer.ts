
import { AsyncDisposer, disposeAsync } from '@tstdl/base/disposable';
import { AsyncEnumerable } from '@tstdl/base/enumerable';
import { Logger } from '@tstdl/base/logger';
import { Job, Queue } from '@tstdl/base/queue';
import { timeout } from '@tstdl/base/utils';
import { CancellationToken } from '@tstdl/base/utils/cancellation-token';
import { Module, ModuleBase, ModuleMetric } from '@tstdl/server/module';
import { AggregatedEntry } from '../common/models';
import { SearchEngine } from '../common/search-engine';
import { AggregatedEntryDataSource } from '../data-sources/aggregated-entry.data-source';

const BATCH_SIZE = 100;

export class EntriesIndexerModule extends ModuleBase implements Module {
  private readonly aggregatedEntryDataSource: AggregatedEntryDataSource;
  private readonly searchEngine: SearchEngine<AggregatedEntry>;
  private readonly entriesToBeIndexedQueue: Queue<string>;
  private readonly logger: Logger;

  constructor(aggregatedEntryDataSource: AggregatedEntryDataSource, searchEngine: SearchEngine<AggregatedEntry>, entriesToBeIndexedQueue: Queue<string>, logger: Logger) {
    super('EntriesIndexer');

    this.aggregatedEntryDataSource = aggregatedEntryDataSource;
    this.searchEngine = searchEngine;
    this.entriesToBeIndexedQueue = entriesToBeIndexedQueue;
    this.logger = logger;
  }

  getMetrics(): ModuleMetric[] {
    return [];
  }

  protected async _run(_cancellationToken: CancellationToken): Promise<void> {
    const disposer = new AsyncDisposer();

    const consumer = this.entriesToBeIndexedQueue.getBatchConsumer(BATCH_SIZE, this.cancellationToken);

    await AsyncEnumerable.from(consumer)
      .forEach(async (batch) => {
        try {
          await this.indexBatch(batch);
          await this.entriesToBeIndexedQueue.acknowledge(batch);
        }
        catch (error) {
          this.logger.error(error as Error);
          await timeout(2500);
        }
      });

    await disposer[disposeAsync]();
  }

  private async indexBatch(batch: Job<string>[]): Promise<void> {
    const ids = batch.map((job) => job.data);
    await this.indexEntries(ids);
  }

  private async indexEntries(ids: string[]): Promise<void> {
    const entries = await this.aggregatedEntryDataSource.loadMany(ids);
    const searchEngineItems = entries.map((entry) => ({ id: entry.id, document: entry }));

    await this.searchEngine.index(searchEngineItems);
  }
}
