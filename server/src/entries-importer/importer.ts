import { AsyncEnumerable } from '../common/enumerable/async-enumerable';
import '../common/extensions/map';
import { Logger } from '../common/logger';
import { Entry } from '../common/model';
import { timeout, formatDuration } from '../common/utils';
import { DatastoreFactory, DataType, Set } from '../datastore';
import { EntrySource } from '../entry-source';
import { Keys } from '../keys';
import { PeriodicReporter } from '../common/utils/periodic-reporter';

const BUFFER_SIZE = 5;
const CONCURRENCY = 3;
const QUEUE_SIZE_LIMIT = 250000;

const REPORT_INTERVAL = 10000;

export class EntriesImporter {
  private readonly entriesToBeSaved: Set<Entry>;
  private readonly logger: Logger;
  private readonly reporter: PeriodicReporter;

  constructor(datastoreFactory: DatastoreFactory, logger: Logger) {
    this.logger = logger;
    this.entriesToBeSaved = datastoreFactory.set(Keys.EntriesToBeSaved, DataType.Object);

    this.reporter = new PeriodicReporter(REPORT_INTERVAL, true, true);

    this.initialize();
  }

  initialize() {
    this.reporter.report.subscribe((count) => this.logger.info(`imported ${count} entries in last ${formatDuration(REPORT_INTERVAL, 0)}`));
    this.reporter.run();
  }

  import(source: EntrySource): Promise<void> {
    return AsyncEnumerable.from(source)
      .buffer(BUFFER_SIZE)
      .intercept(async () => {
        while (true) {
          try {
            const count = await this.entriesToBeSaved.count();

            if (count < QUEUE_SIZE_LIMIT) {
              break;
            }

            await timeout(1000);
          } catch {
            await timeout(1000);
          }
        }
      })
      .parallelForEach(CONCURRENCY, async (batch) => {
        let success = false;
        do {
          try {
            await this.entriesToBeSaved.addMany(batch);
            success = true;
          } catch (error) {
            this.logger.error(error);
            await timeout(2500);
          }
        } while (!success);

        this.reporter.increase(batch.length);
      });
  }
}
