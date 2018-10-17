import { AsyncEnumerable } from '../common/enumerable/async-enumerable';
import '../common/extensions/map';
import { Logger } from '../common/logger';
import { Entry } from '../common/model';
import { formatDuration, ProviderFunctionIterable, ProviderFunctionResult, timeout } from '../common/utils';
import { PeriodicReporter } from '../common/utils/periodic-reporter';
import { DatastoreFactory, DataType, Set } from '../datastore';
import { Keys } from '../keys';
import { EntryRepository } from '../repository/entry-repository';

const BATCH_SIZE = 250;
const BATCH_BUFFER_SIZE = 5;
const NO_ITEMS_DELAY = 2500;

const REPORT_INTERVAL = 10000;

export class EntriesSaver {
  private readonly entryRepository: EntryRepository;
  private readonly entriesToBeSaved: Set<Entry>;
  private readonly entriesToBeIndexed: Set<string>;
  private readonly logger: Logger;
  private readonly reporter: PeriodicReporter;

  constructor(entryRepository: EntryRepository, datastoreFactory: DatastoreFactory, logger: Logger) {
    this.entryRepository = entryRepository;
    this.logger = logger;

    this.reporter = new PeriodicReporter(REPORT_INTERVAL, true, true);
    this.entriesToBeSaved = datastoreFactory.set(Keys.EntriesToBeSaved, DataType.Object);
    this.entriesToBeIndexed = datastoreFactory.set(Keys.EntriesToBeIndexed, DataType.String);

    this.initialize();
  }

  initialize() {
    this.reporter.report.subscribe((count) => this.logger.info(`saved ${count} entries in last ${formatDuration(REPORT_INTERVAL, 0)}`));
    this.reporter.run();
  }

  async run(): Promise<void> {
    const entriesToBeSavedIterable = new ProviderFunctionIterable(() => this.providerFunction(), NO_ITEMS_DELAY);

    await AsyncEnumerable.from(entriesToBeSavedIterable)
      .buffer(BATCH_BUFFER_SIZE)
      .forEach(async (batch) => {
        try {
          await this.saveEntries(batch);
        }
        catch (error) {
          this.logger.error(error);

          await this.pushBack(batch);
          await timeout(2500);
        }
      });
  }

  private async pushBack(batch: Entry[]): Promise<void> {
    let success = false;
    while (!success) {
      try {
        await this.entriesToBeSaved.addMany(batch);
        success = true;
      }
      catch (error) {
        this.logger.error(error);
        await timeout(2500);
      }
    }
  }

  private async providerFunction(): Promise<ProviderFunctionResult<Entry[]>> {
    try {
      const entriesBatch = await this.entriesToBeSaved.pop(BATCH_SIZE);
      return { hasItem: entriesBatch.length > 0, item: entriesBatch };
    }
    catch (error) {
      this.logger.error(error);
      return { hasItem: false };
    }
  }

  private async saveEntries(entries: Entry[]): Promise<void> {
    const ids = entries.map((entry) => entry.id);

    try {
      await this.entryRepository.saveMany(entries);
    } catch (error) {
      this.logger.error(error);
    }

    try {
      await this.entriesToBeIndexed.addMany(ids);
    } catch (error) {
      this.logger.error(error);
    }

    this.reporter.increase(entries.length);
  }
}
