import { AsyncDisposer } from '../common/disposable';
import { AsyncEnumerable } from '../common/enumerable/async-enumerable';
import { Logger } from '../common/logger';
import { Entry } from '../common/model';
import { DeferredPromise, formatDuration, timeout } from '../common/utils';
import { PeriodicReporter } from '../common/utils/periodic-reporter';
import { Keys } from '../keys';
import { Queue, QueueProvider } from '../queue';
import { EntryRepository } from '../repository/entry-repository';
import { Service } from '../service';
import { ServiceBase } from '../service-base';

const BATCH_SIZE = 250;
const BUFFER_SIZE = 3;
const CONCURRENCY = 3;

const REPORT_INTERVAL = 10000;

export class EntriesSaver extends ServiceBase implements Service {
  private readonly entryRepository: EntryRepository;
  private readonly entriesToBeSavedQueue: Queue<Entry>;
  private readonly entriesToBeIndexedQueue: Queue<string>;
  private readonly logger: Logger;
  private readonly reporter: PeriodicReporter;
  private readonly disposer: AsyncDisposer;
  private readonly stopped: DeferredPromise;

  constructor(entryRepository: EntryRepository, queueProvider: QueueProvider, logger: Logger) {
    super();

    this.entryRepository = entryRepository;
    this.logger = logger;

    this.disposer = new AsyncDisposer();
    this.reporter = new PeriodicReporter(REPORT_INTERVAL, true, true);

    this.entriesToBeSavedQueue = queueProvider.get(Keys.EntriesToBeSaved, 30000, 3);
    this.entriesToBeIndexedQueue = queueProvider.get(Keys.EntriesToBeIndexed, 30000, 3);

    this.disposer.addDisposeTasks(async () => await this.entriesToBeSavedQueue.dispose());
    this.disposer.addDisposeTasks(async () => await this.entriesToBeIndexedQueue.dispose());

    this.stopped = new DeferredPromise();
  }

  protected async _initialize(): Promise<void> {
    await this.entriesToBeSavedQueue.initialize();
    await this.entriesToBeIndexedQueue.initialize();

    this.reporter.report.subscribe((count) => this.logger.info(`saved ${count} entries in last ${formatDuration(REPORT_INTERVAL, 0)}`));
    this.reporter.run();

    this.disposer.addDisposeTasks(async () => await this.reporter.stop());
  }

  protected async _dispose(): Promise<void> {
    await this.disposer.dispose();
  }

  protected async _start(): Promise<void> {
    const consumer = this.entriesToBeSavedQueue.getBatchConsumer(BATCH_SIZE, false);

    await AsyncEnumerable.from(consumer)
      .cancelable(this.stopRequestedPromise)
      .buffer(BUFFER_SIZE)
      .parallelForEach(CONCURRENCY, async (batch) => {
        try {
          const entries = batch.map((job) => job.data);
          await this.saveEntries(entries);
          await this.entriesToBeSavedQueue.acknowledge(...batch);
        }
        catch (error) {
          this.logger.error(error as Error);
          await timeout(2500);
        }
      });

    this.stopped.resolve();
  }

  protected async _stop(): Promise<void> {
    await this.stopped;
  }

  private async saveEntries(entries: Entry[]): Promise<void> {
    const ids = entries.map((entry) => entry.id);
    await this.entryRepository.saveMany(entries);
    await this.entriesToBeIndexedQueue.enqueueMany(ids);

    this.reporter.increase(entries.length);
  }
}
