import { AsyncEnumerable } from '../common/enumerable';
import { LockProvider } from '../common/lock';
import { AggregatedEntry } from '../common/model';
import { SearchEngine } from '../common/search-engine';
import { ProviderFunctionIterable, timeout } from '../common/utils';
import { DatastoreFactory, DataType, Set } from '../datastore';
import { Keys } from '../keys';
import { LoggerFactoryProvider } from '../logger-factory-provider';
import { AggregatedEntryRepository } from '../repository';

const BATCH_SIZE = 250;
const BATCH_BUFFER_SIZE = 10;
const CONCURRENCY = 3;

const logger = LoggerFactoryProvider.factory.create('[INDEXER]');

export class EntriesIndexer {
  private readonly aggregatedEntryRepository: AggregatedEntryRepository;
  private readonly searchEngine: SearchEngine<AggregatedEntry>;
  private readonly lockProvider: LockProvider;
  private readonly entriesToBeIndexed: Set<string>;

  constructor(indexedEntryRepository: AggregatedEntryRepository, searchEngine: SearchEngine<AggregatedEntry>, lockProvider: LockProvider, datastoreFactory: DatastoreFactory) {
    this.aggregatedEntryRepository = indexedEntryRepository;
    this.searchEngine = searchEngine;
    this.lockProvider = lockProvider;
    this.entriesToBeIndexed = datastoreFactory.set(Keys.EntriesToBeIndexed, DataType.String);
  }

  async run() {
    const entriesToBeIndexedIterable = new ProviderFunctionIterable(BATCH_BUFFER_SIZE, () => this.providerFunction());

    for await (const batch of entriesToBeIndexedIterable) {
      try {
        await this.indexEntries(batch);
      }
      catch (error) {
        logger.error(error);
        await this.entriesToBeIndexed.addMany(batch);
      }
    }
  }

  private async providerFunction(): Promise<string[]> {
    let ids: string[] = [];

    do {
      try {
        const popped = this.entriesToBeIndexed.pop(BATCH_SIZE);
        ids = await AsyncEnumerable.toArray(popped);
      }
      catch (error) {
        logger.error(error);
      }

      if (ids.length == 0) {
        await timeout(1000);
      }
    }
    while (ids.length == 0);

    return ids;
  }

  private async indexEntries(ids: string[]) {
    const entries = await this.aggregatedEntryRepository.loadMany(ids);
    const entriesArray = await AsyncEnumerable.toArray(entries);
    const searchEngineItems = entriesArray.map((entry) => ({ id: entry.id, document: entry }));

    await this.searchEngine.index(searchEngineItems);

    logger.verbose(`indexed ${searchEngineItems.length} entries`);
  }
}
