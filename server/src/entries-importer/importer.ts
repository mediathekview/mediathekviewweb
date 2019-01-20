import { AsyncDisposer } from '../common/disposable';
import { AsyncEnumerable } from '../common/enumerable/async-enumerable';
import { Logger } from '../common/logger';
import { Entry } from '../common/model';
import { formatDuration, timeout } from '../common/utils';
import { PeriodicReporter } from '../common/utils/periodic-reporter';
import { EntrySource } from '../entry-source';
import { Keys } from '../keys';
import { Queue, QueueProvider } from '../queue';
import { Service } from '../service';
import { ServiceBase } from '../service-base';

const REPORT_INTERVAL = 10000;

export class EntriesImporter extends ServiceBase implements Service {
  private readonly disposer: AsyncDisposer;
  private readonly entriesToBeSavedQueue: Queue<Entry>;
  private readonly logger: Logger;
  private readonly reporter: PeriodicReporter;
  private readonly sources: EntrySource[];

  constructor(queueProvider: QueueProvider, logger: Logger) {
    super();

    this.logger = logger;

    this.disposer = new AsyncDisposer();
    this.entriesToBeSavedQueue = queueProvider.get(Keys.EntriesToBeSaved, 30000, 3);
    this.reporter = new PeriodicReporter(REPORT_INTERVAL, true, true);
    this.sources = [];

    this.disposer.addDisposeTasks(async () => await this.entriesToBeSavedQueue.dispose());
  }

  registerSources(...sources: EntrySource[]): void {
    this.sources.push(...sources);
  }

  protected async _dispose(): Promise<void> {
    await this.disposer.dispose();
  }

  protected async _initialize(): Promise<void> {
    await this.entriesToBeSavedQueue.initialize();

    this.reporter.report.subscribe((count) => this.logger.info(`imported ${count} entries in last ${formatDuration(REPORT_INTERVAL, 0)}`));

    this.disposer.addDisposeTasks(async () => await this.reporter.stop());
  }

  protected async _start(): Promise<void> {
    if (this.sources.length == 0) {
      throw new Error('no source available');
    }

    const promises = this.sources.map((source) => this.import(source)); // tslint:disable-line: promise-function-async

    this.reporter.run();
    await Promise.all(promises);
  }

  protected async _stop(): Promise<void> {
    throw new Error('not supported');
  }

  private async import(source: EntrySource): Promise<void> {
    await this.disposer.defer(async () => await this._import(source));
  }

  private async _import(source: EntrySource): Promise<void> {
    await AsyncEnumerable.from(source)
      .cancelable(this.stopRequestedPromise)
      .forEach(async (batch) => {
        let success = false;

        while (!success && !this.stopRequested) {
          try {
            await this.entriesToBeSavedQueue.enqueueMany(batch);
            this.reporter.increase(batch.length);
            success = true;
          }
          catch (error) {
            this.logger.error(error);

            if (!this.stopRequested) {
              await timeout(1000);
            }
          }
        }
      });
  }
}
