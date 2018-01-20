import { EntryRepository } from '../repository/entry-repository';
import { LockProvider } from '../lock';
import { AsyncEnumerable } from '../common/enumerable';
import { Entry, AggregatedEntry } from '../common/model';
import { DatastoreProvider, DataType, Set } from '../datastore';
import { Keys } from '../keys';
import { ProviderFunctionIterable, sleep, ProviderFunction } from '../common/utils';
import { SearchEngine, SearchEngineItem } from '../common/search-engine';
import { AggregatedEntryRepository } from '../repository';

const BATCH_SIZE = 250;
const BATCH_BUFFER_SIZE = 10;
const CONCURRENCY = 3;

export class EntriesIndexer {
  private readonly aggregatedEntryRepository: AggregatedEntryRepository;
  private readonly searchEngine: SearchEngine<AggregatedEntry>;
  private readonly lockProvider: LockProvider;
  private readonly entriesToBeIndexed: Set<string>;

  constructor(indexedEntryRepository: AggregatedEntryRepository, searchEngine: SearchEngine<AggregatedEntry>, lockProvider: LockProvider, datastoreProvider: DatastoreProvider) {
    this.aggregatedEntryRepository = indexedEntryRepository;
    this.searchEngine = searchEngine;
    this.lockProvider = lockProvider;
    this.entriesToBeIndexed = datastoreProvider.set(Keys.EntriesToBeIndexed, DataType.String);
  }

  async run() {
    const entriesToBeIndexedIterable = new ProviderFunctionIterable(BATCH_BUFFER_SIZE, () => this.providerFunction());

    for await (const batch of entriesToBeIndexedIterable) {
      try {
        await this.indexEntries(batch);
      }
      catch (error) {
        console.error(error);
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
        console.error(error);
      }

      if (ids.length == 0) {
        await sleep(1000);
      }
    }
    while (ids.length == 0);

    return ids;
  }

  private async indexEntries(ids: string[]) {
    const entries = await this.aggregatedEntryRepository.loadMany(ids);
    const entriesArray = await AsyncEnumerable.toSync(entries);
    const searchEngineItems = entriesArray.map((entry) => ({ id: entry.id, document: entry })).toArray();

    await this.searchEngine.index(searchEngineItems);

    console.log(`indexed ${searchEngineItems.length} entries`);
  }
}