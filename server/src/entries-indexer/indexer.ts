import { AsyncEnumerable } from '../common/enumerable';
import { Logger } from '../common/logger';
import { AggregatedEntry } from '../common/model';
import { SearchEngine } from '../common/search-engine';
import { formatDuration, ProviderFunctionIterable, ProviderFunctionResult, timeout } from '../common/utils';
import { PeriodicReporter } from '../common/utils/periodic-reporter';
import { DatastoreFactory, DataType, Set } from '../datastore';
import { Keys } from '../keys';
import { AggregatedEntryRepository } from '../repository';

const BATCH_SIZE = 250;
const BATCH_BUFFER_SIZE = 5;
const NO_ITEMS_DELAY = 2500;

const REPORT_INTERVAL = 10000;

export class EntriesIndexer {
  private readonly aggregatedEntryRepository: AggregatedEntryRepository;
  private readonly searchEngine: SearchEngine<AggregatedEntry>;
  private readonly entriesToBeIndexed: Set<string>;
  private readonly logger: Logger;
  private readonly reporter: PeriodicReporter;

  constructor(indexedEntryRepository: AggregatedEntryRepository, searchEngine: SearchEngine<AggregatedEntry>, datastoreFactory: DatastoreFactory, logger: Logger) {
    this.aggregatedEntryRepository = indexedEntryRepository;
    this.searchEngine = searchEngine;
    this.logger = logger;

    this.reporter = new PeriodicReporter(REPORT_INTERVAL, true, true);
    this.entriesToBeIndexed = datastoreFactory.set(Keys.EntriesToBeIndexed, DataType.String);

    this.initialize();
  }

  initialize() {
    this.reporter.report.subscribe((count) => this.logger.info(`indexed ${count} entries in last ${formatDuration(REPORT_INTERVAL, 0)}`));
    this.reporter.run();
  }

  async run() {
    const entriesToBeIndexedIterable = new ProviderFunctionIterable(() => this.providerFunction(), NO_ITEMS_DELAY);

    await AsyncEnumerable.from(entriesToBeIndexedIterable)
      .buffer(BATCH_BUFFER_SIZE)
      .forEach(async (batch) => {
        try {
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
    this.reporter.increase(ids.length);
  }
}
