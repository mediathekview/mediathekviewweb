import { Logger } from '@tstdl/base/logger';
import { timeout } from '@tstdl/base/utils';
import { CancellationToken } from '@tstdl/base/utils/cancellation-token';
import { Module, ModuleBase, ModuleMetricType } from '@tstdl/server/module';
import { AggregatedEntry, Entry } from '../common/models';
import { SearchEngine } from '../common/search-engine';
import { AggregatedEntryDataSource } from '../data-sources/aggregated-entry.data-source';
import { EntryRepository } from '../repositories';

const BATCH_SIZE = 100;

export class EntriesIndexerModule extends ModuleBase implements Module {
  private readonly entryRepository: EntryRepository;
  private readonly aggregatedEntryDataSource: AggregatedEntryDataSource;
  private readonly searchEngine: SearchEngine<AggregatedEntry>;
  private readonly logger: Logger;

  private indexedEntriesCount: number;

  // tslint:disable-next-line: typedef
  readonly metrics = {
    indexedEntriesCount: {
      type: ModuleMetricType.Counter,
      getValue: () => this.indexedEntriesCount
    }
  };

  constructor(entryRepository: EntryRepository, aggregatedEntryDataSource: AggregatedEntryDataSource, searchEngine: SearchEngine<AggregatedEntry>, logger: Logger) {
    super('EntriesIndexer');

    this.entryRepository = entryRepository;
    this.aggregatedEntryDataSource = aggregatedEntryDataSource;
    this.searchEngine = searchEngine;
    this.logger = logger;

    this.indexedEntriesCount = 0;
  }

  protected async _run(cancellationToken: CancellationToken): Promise<void> {
    while (!cancellationToken.isSet) {
      try {
        const { jobId, entries } = await this.entryRepository.getIndexJob(BATCH_SIZE, 10000);
        await this.indexEntries(jobId, entries);
        this.indexedEntriesCount += entries.length;
      }
      catch (error) {
        this.logger.error(error as Error);
        await timeout(2500);
      }
    }
  }

  private async indexEntries(jobId: string, entries: Entry[]): Promise<void> {
    const aggregatedEntries = await this.aggregatedEntryDataSource.aggregateMany(entries);
    const searchEngineItems = aggregatedEntries.map((entry) => ({ id: entry.id, document: entry }));

    await this.searchEngine.index(searchEngineItems);
    await this.entryRepository.setIndexJobFinished(jobId);
  }
}
