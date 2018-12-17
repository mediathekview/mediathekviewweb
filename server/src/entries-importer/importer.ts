import { AsyncDisposable } from '../common/disposable';
import { AsyncEnumerable } from '../common/enumerable/async-enumerable';
import '../common/extensions/map';
import { Logger } from '../common/logger';
import { Entry } from '../common/model';
import { formatDuration, timeout } from '../common/utils';
import { PeriodicReporter } from '../common/utils/periodic-reporter';
import { EntrySource } from '../entry-source';
import { Keys } from '../keys';
import { Queue, QueueProvider } from '../queue';

const BUFFER_SIZE = 5;
const REPORT_INTERVAL = 10000;

export class EntriesImporter implements AsyncDisposable {
  private readonly entriesToBeSavedQueue: Queue<Entry>;
  private readonly logger: Logger;
  private readonly reporter: PeriodicReporter;

  private stop: boolean;

  constructor(queueProvider: QueueProvider, logger: Logger) {
    this.logger = logger;

    this.entriesToBeSavedQueue = queueProvider.get(Keys.EntriesToBeSaved, 30);
    this.reporter = new PeriodicReporter(REPORT_INTERVAL, true, true);

    this.initialize();
  }

  initialize() {
    this.reporter.report.subscribe((count) => this.logger.info(`imported ${count} entries in last ${formatDuration(REPORT_INTERVAL, 0)}`));
    this.reporter.run();
  }

  async import(source: EntrySource): Promise<void> {
    this.stop = false;

    await AsyncEnumerable.from(source)
      .while(() => !this.stop)
      .buffer(BUFFER_SIZE)
      .forEach(async (batch) => {
        let success = false;

        do {
          try {
            await this.entriesToBeSavedQueue.enqueueMany(batch);
            success = true;
          }
          catch (error) {
            this.logger.error(error);
            await timeout(2500);
          }
        }
        while (!success);

        this.reporter.increase(batch.length);
      });
  }
}
