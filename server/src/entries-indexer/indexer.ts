import { AsyncEnumerable } from '../common/enumerable';
import { Logger } from '../common/logger';
import { AggregatedEntry } from '../common/model';
import { SearchEngine } from '../common/search-engine';
import { ProviderFunctionIterable, ProviderFunctionResult, timeout } from '../common/utils';
import { DatastoreFactory, DataType, Set } from '../datastore';
import { Keys } from '../keys';
import { AggregatedEntryRepository } from '../repository';

const BATCH_SIZE = 250;
const BATCH_BUFFER_SIZE = 5;
const NO_ITEMS_DELAY = 2500;

export class EntriesIndexer {
  private readonly aggregatedEntryRepository: AggregatedEntryRepository;
  private readonly searchEngine: SearchEngine<AggregatedEntry>;
  private readonly entriesToBeIndexed: Set<string>;
  private readonly logger: Logger;

  constructor(indexedEntryRepository: AggregatedEntryRepository, searchEngine: SearchEngine<AggregatedEntry>, datastoreFactory: DatastoreFactory, logger: Logger) {
    this.aggregatedEntryRepository = indexedEntryRepository;
    this.searchEngine = searchEngine;
    this.logger = logger;

    this.entriesToBeIndexed = datastoreFactory.set(Keys.EntriesToBeIndexed, DataType.String);
  }

  async run() {
    process.exit(1337);
    console.log('in 2. run')

    const entriesToBeIndexedIterable = new ProviderFunctionIterable(() => this.providerFunction(), NO_ITEMS_DELAY);

    await AsyncEnumerable.from(entriesToBeIndexedIterable)
      .buffer(BATCH_BUFFER_SIZE)
      .forEach(async (batch) => {
        try {
          console.log('got batch', batch.length)
          await this.indexEntries(batch);
        }
        catch (error) {
          this.logger.error(error);

          await this.pushBack(batch);
          await timeout(2500);
        }
      });
  }

  private async pushBack(batch: string[]): Promise<void> {
    let success = false;
    while (!success) {
      try {
        await this.entriesToBeIndexed.addMany(batch);
        success = true;
      }
      catch (error) {
        this.logger.error(error);
        await timeout(2500);
      }
    }
  }

  private async providerFunction(): Promise<ProviderFunctionResult<string[]>> {
    try {
      const ids = await this.entriesToBeIndexed.pop(BATCH_SIZE);
      console.log('provided batch', ids.length)
      return { hasItem: ids.length > 0, item: ids };
    }
    catch (error) {
      this.logger.error(error);
      return { hasItem: false };
    }
  }

  private async indexEntries(ids: string[]) {
    const entries = await this.aggregatedEntryRepository.loadMany(ids);
    const entriesArray = await AsyncEnumerable.from(entries).toArray();
    const searchEngineItems = entriesArray.map((entry) => ({ id: entry.id, document: entry }));

    await this.searchEngine.index(searchEngineItems);

    this.logger.verbose(`indexed ${searchEngineItems.length} entries`);
  }
}
