import { SyncEnumerable } from '../common/enumerable';
import { AsyncEnumerable } from '../common/enumerable/async-enumerable';
import '../common/extensions/map';
import { LockProvider } from '../common/lock';
import { MultiLock } from '../common/lock/multi-lock';
import { Logger } from '../common/logger';
import { Entry } from '../common/model';
import { DatastoreFactory, DataType, Set } from '../datastore';
import { EntrySource } from '../entry-source';
import { Keys } from '../keys';
import { EntryRepository } from '../repository/entry-repository';
import { timeout } from '../common/utils';

const BUFFER_SIZE = 10;
const CONCURRENCY = 3;

let counter = 0;

export class EntriesImporter {
  private readonly entryRepository: EntryRepository;
  private readonly lockProvider: LockProvider;
  private readonly entriesToBeIndexed: Set<string>;
  private readonly logger: Logger;

  constructor(entryRepository: EntryRepository, lockProvider: LockProvider, datastoreFactory: DatastoreFactory, logger: Logger) {
    this.entryRepository = entryRepository;
    this.lockProvider = lockProvider;
    this.logger = logger;
    this.entriesToBeIndexed = datastoreFactory.set(Keys.EntriesToBeIndexed, DataType.String);
  }

  import(source: EntrySource): Promise<void> {
    return AsyncEnumerable.from(source).buffer(BUFFER_SIZE)
      .parallelForEach(CONCURRENCY, async (batch) => {
        const ids = batch.map((entry) => entry.id);

        try {
          await this.entryRepository.saveMany(batch);
        } catch (error) {
          this.logger.error(error);
        }

        try {
          await this.entriesToBeIndexed.addMany(ids);
        } catch (error) {
          this.logger.error(error);
        }

        this.logger.verbose(`imported ${batch.length} entries`);
      });
  }
}
