import { AsyncDisposable, AsyncDisposer } from '../common/disposable';
import { AsyncEnumerable } from '../common/enumerable/async-enumerable';
import '../common/extensions/map';
import { Logger } from '../common/logger';
import { Entry } from '../common/model';
import { formatDuration, timeout } from '../common/utils';
import { PeriodicReporter } from '../common/utils/periodic-reporter';
import { EntrySource } from '../entry-source';
import { Keys } from '../keys';
import { Queue, QueueProvider } from '../queue';

const BUFFER_SIZE = 3;
const REPORT_INTERVAL = 10000;

export class EntriesImporter implements AsyncDisposable {
  private readonly disposer: AsyncDisposer;
  private readonly entriesToBeSavedQueue: Queue<Entry>;
  private readonly logger: Logger;
  private readonly reporter: PeriodicReporter;

  constructor(queueProvider: QueueProvider, logger: Logger) {
    this.logger = logger;

    this.disposer = new AsyncDisposer();
    this.entriesToBeSavedQueue = queueProvider.get(Keys.EntriesToBeSaved, 30000, 3);
    this.reporter = new PeriodicReporter(REPORT_INTERVAL, true, true);

    this.initialize();
  }

  private initialize() {
    this.reporter.report.subscribe((count) => this.logger.info(`imported ${count} entries in last ${formatDuration(REPORT_INTERVAL, 0)}`));
    this.reporter.run();

    this.disposer.addSubDisposables(this.entriesToBeSavedQueue);
    this.disposer.addDisposeTasks(async () => await this.reporter.stop());
  }

  async dispose(): Promise<void> {
    await this.disposer.dispose();
  }

  async import(source: EntrySource): Promise<void> {
    await this.disposer.deferDispose(async () => await this._import(source));
  }

  private async _import(source: EntrySource): Promise<void> {
    await AsyncEnumerable.from(source)
      .while(() => !this.disposer.disposed)
      .buffer(BUFFER_SIZE)
      .forEach(async (batch) => {
        let success = false;

        do {
          try {
            await this.entriesToBeSavedQueue.enqueueMany(batch);
            this.reporter.increase(batch.length);
            success = true;
          }
          catch (error) {
            this.logger.error(error);
            await timeout(2500);
          }
        }
        while (!success);
      });
  }
}
