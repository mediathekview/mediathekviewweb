import { AsyncDisposable, AsyncDisposer } from '../common/disposable';
import { AsyncEnumerable } from '../common/enumerable/async-enumerable';
import '../common/extensions/map';
import { Logger } from '../common/logger';
import { Entry } from '../common/model';
import { formatDuration, ProviderFunctionIterable, ProviderFunctionResult, timeout } from '../common/utils';
import { PeriodicReporter } from '../common/utils/periodic-reporter';
import { Keys } from '../keys';
import { Queue, QueueProvider } from '../queue';
import { EntryRepository } from '../repository/entry-repository';

const BATCH_SIZE = 250;
const BATCH_BUFFER_SIZE = 5;
const NO_ITEMS_DELAY = 2500;

const REPORT_INTERVAL = 10000;

export class EntriesSaver implements AsyncDisposable {
  private readonly entryRepository: EntryRepository;
  private readonly entriesToBeSavedQueue: Queue<Entry>;
  private readonly entriesToBeIndexedQueue: Queue<string>;
  private readonly logger: Logger;
  private readonly reporter: PeriodicReporter;
  private readonly disposer: AsyncDisposer;

  private stop: boolean;

  constructor(entryRepository: EntryRepository, queueProvider: QueueProvider, logger: Logger) {
    this.entryRepository = entryRepository;
    this.logger = logger;

    this.disposer = new AsyncDisposer();
    this.reporter = new PeriodicReporter(REPORT_INTERVAL, true, true);

    this.entriesToBeSavedQueue = queueProvider.get(Keys.EntriesToBeSaved, 30);
    this.entriesToBeIndexedQueue = queueProvider.get(Keys.EntriesToBeIndexed, 30);

    this.initialize();
  }

  initialize() {
    this.reporter.report.subscribe((count) => this.logger.info(`saved ${count} entries in last ${formatDuration(REPORT_INTERVAL, 0)}`));
    this.reporter.run();
  }

  async dispose(): Promise<void> {
    await this.disposer.dispose();
  }

  async run(): Promise<void> {
    this.stop = false;

    await AsyncEnumerable.from(entriesToBeSavedIterable)
      .while(() => !this.stop)
      .buffer(BATCH_BUFFER_SIZE)
      .forEach(async (batch) => {
        try {
          await this.saveEntries(batch);
        }
        catch (error) {
          this.logger.error(error);
          await timeout(2500);
        }
      });
  }

  private async saveEntries(entries: Entry[]): Promise<void> {
    const ids = entries.map((entry) => entry.id);

    try {
      await this.entryRepository.saveMany(entries);
    } catch (error) {
      this.logger.error(error);
    }

    try {
      await this.entriesToBeIndexedQueue.addMany(ids);
    } catch (error) {
      this.logger.error(error);
    }

    this.reporter.increase(entries.length);
  }
}
