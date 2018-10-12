import { AsyncEnumerable } from '../common/enumerable/async-enumerable';
import '../common/extensions/map';
import { Logger } from '../common/logger';
import { Entry } from '../common/model';
import { timeout } from '../common/utils';
import { DatastoreFactory, DataType, Set } from '../datastore';
import { EntrySource } from '../entry-source';
import { Keys } from '../keys';

const BUFFER_SIZE = 5;
const CONCURRENCY = 3;
const SET_SIZE_LIMIT = 250000;

export class EntriesImporter {
  private readonly entriesToBeSaved: Set<Entry>;
  private readonly logger: Logger;

  constructor(datastoreFactory: DatastoreFactory, logger: Logger) {
    this.logger = logger;
    this.entriesToBeSaved = datastoreFactory.set(Keys.EntriesToBeSaved, DataType.Object);
  }

  import(source: EntrySource): Promise<void> {
    return AsyncEnumerable.from(source)
      .buffer(BUFFER_SIZE)
      .intercept(async () => {
        while ((await this.entriesToBeSaved.count()) > SET_SIZE_LIMIT) {
          await timeout(1000);
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

        this.logger.verbose(`imported ${batch.length} entries`);
      });
  }
}
