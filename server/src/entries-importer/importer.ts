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

const BUFFER_SIZE = 10;
const CONCURRENCY = 3;

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
    return AsyncEnumerable.from(source)
      .buffer(BUFFER_SIZE)
      .parallelForEach(CONCURRENCY, async (batch) => {
        const ids = batch.map((entry) => entry.id);
        const multiLock = new MultiLock(this.lockProvider, ...ids);

        let acquireSuccess: boolean;
       // do {
        //  acquireSuccess = await multiLock.acquire();
      //  } while (!acquireSuccess);

        const existingEntries = this.entryRepository.loadMany(ids);
        const existingEntriesMap = new Map<string, Entry>();

        for await (const entry of existingEntries) {
          existingEntriesMap.set(entry.id, entry);
        }

        const toBeImported = SyncEnumerable.from(batch)
          .filter((entry) => {
            const existingEntry = existingEntriesMap.get(entry.id);
            return (existingEntry == null) || (entry.lastSeen > existingEntry.lastSeen);
          })
          .toArray();
        const toBeImportedIds = toBeImported.map((entry) => entry.id);

        try {
          await this.entryRepository.saveMany(toBeImported);
        } catch (error) {
          this.logger.error(error);
        }

        try {
          await this.entriesToBeIndexed.addMany(toBeImportedIds);
        } catch (error) {
          this.logger.error(error);
        }

        let releaseSuccess = false;
        do {
          releaseSuccess = await multiLock.release();
        } while (!releaseSuccess);

        this.logger.verbose(`imported ${toBeImportedIds.length} entries`);
      });
  }
}
