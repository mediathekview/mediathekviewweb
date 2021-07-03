import type { IndexedEntry, Entry } from '$shared/models/core';
import type { SearchEngine } from '$shared/search-engine';
import type { Logger } from '@tstdl/base/logger';
import { cancelableTimeout } from '@tstdl/base/utils';
import type { CancellationToken } from '@tstdl/base/utils/cancellation-token';
import type { Module } from '@tstdl/server/module';
import { ModuleBase, ModuleMetricType } from '@tstdl/server/module';
import type { AggregatedEntryDataSource } from '../data-sources/aggregated-entry.data-source';
import type { EntryRepository } from '../repositories';

const BATCH_SIZE = 250;

export class EntriesIndexerModule extends ModuleBase implements Module {
  private readonly entryRepository: EntryRepository;
  private readonly aggregatedEntryDataSource: AggregatedEntryDataSource;
  private readonly searchEngine: SearchEngine<IndexedEntry>;
  private readonly logger: Logger;

  private indexedEntriesCount: number;

  readonly metrics = {
    indexedEntriesCount: {
      type: ModuleMetricType.Counter,
      getValue: () => this.indexedEntriesCount // eslint-disable-line no-invalid-this
    }
  };

  constructor(entryRepository: EntryRepository, aggregatedEntryDataSource: AggregatedEntryDataSource, searchEngine: SearchEngine<IndexedEntry>, logger: Logger) {
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
        await this.waitForPendingJob(cancellationToken);

        while (!cancellationToken.isSet) {
          const jobLength = await this.getAndWorkOnJob();

          if (jobLength == 0) {
            break;
          }
        }
      }
      catch (error: unknown) {
        this.logger.error(error as Error);
        await cancelableTimeout(2500, cancellationToken);
      }
    }
  }

  private async waitForPendingJob(cancellationToken: CancellationToken): Promise<void> {
    while (!cancellationToken.isSet) {
      const has = await this.entryRepository.hasPendingJob();

      if (has) {
        break;
      }

      await cancelableTimeout(2500, cancellationToken);
    }
  }

  private async getAndWorkOnJob(): Promise<number> {
    const { jobId, entries } = await this.entryRepository.getIndexJob(BATCH_SIZE, 15000);

    if (entries.length == 0) {
      return 0;
    }

    await this.indexEntries(jobId, entries);
    this.indexedEntriesCount += entries.length;

    return entries.length;
  }

  private async indexEntries(jobId: string, entries: Entry[]): Promise<void> {
    const aggregatedEntries = await this.aggregatedEntryDataSource.aggregateMany(entries);
    const searchEngineItems = aggregatedEntries.map((entry) => ({ id: entry.id, document: entry }));

    await this.searchEngine.index(searchEngineItems);
    await this.entryRepository.setIndexJobFinished(jobId);
  }
}
