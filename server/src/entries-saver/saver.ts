import { AsyncDisposable, AsyncDisposer } from '../common/disposable';
import { AsyncEnumerable } from '../common/enumerable/async-enumerable';
import '../common/extensions/map';
import { Logger } from '../common/logger';
import { Entry } from '../common/model';
import { formatDuration, timeout } from '../common/utils';
import { PeriodicReporter } from '../common/utils/periodic-reporter';
import { Keys } from '../keys';
import { Queue, QueueProvider } from '../queue';
import { EntryRepository } from '../repository/entry-repository';

const BATCH_SIZE = 250;
const BUFFER_SIZE = 3;

const REPORT_INTERVAL = 10000;

export class EntriesSaver implements AsyncDisposable {
  private readonly entryRepository: EntryRepository;
  private readonly entriesToBeSavedQueue: Queue<Entry>;
  private readonly entriesToBeIndexedQueue: Queue<string>;
  private readonly logger: Logger;
  private readonly reporter: PeriodicReporter;
  private readonly disposer: AsyncDisposer;

  constructor(entryRepository: EntryRepository, queueProvider: QueueProvider, logger: Logger) {
    this.entryRepository = entryRepository;
    this.logger = logger;

    this.disposer = new AsyncDisposer();
    this.reporter = new PeriodicReporter(REPORT_INTERVAL, true, true);

    this.entriesToBeSavedQueue = queueProvider.get(Keys.EntriesToBeSaved, 30000, 3);
    this.entriesToBeIndexedQueue = queueProvider.get(Keys.EntriesToBeIndexed, 30000, 3);

    this.disposer.addSubDisposables(this.entriesToBeSavedQueue, this.entriesToBeIndexedQueue);

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
    const consumer = this.entriesToBeSavedQueue.getBatchConsumer(BATCH_SIZE, false);

    await AsyncEnumerable.from(consumer)
      .while(() => !this.disposer.disposed)
      .buffer(BUFFER_SIZE)
      .forEach(async (batch) => {
        try {
          const entries = batch.map((job) => job.data);
          await this.saveEntries(entries);
          await this.entriesToBeSavedQueue.acknowledge(...batch);
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
      await this.entriesToBeIndexedQueue.enqueueMany(ids);
    } catch (error) {
      this.logger.error(error);
    }

    this.reporter.increase(entries.length);
  }
}
