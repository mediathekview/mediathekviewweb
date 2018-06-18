import { AsyncEnumerable } from '../common/enumerable/async-enumerable';
import { Logger } from '../common/logger';
import { DatastoreFactory, DataType, Set } from '../datastore';
import { EntrySource } from '../entry-source';
import { Keys } from '../keys';
import { EntryRepository } from '../repository/entry-repository';

const BUFFER_SIZE = 10;
const CONCURRENCY = 3;

export class EntriesImporter {
  private readonly entryRepository: EntryRepository;
  private readonly entriesToBeIndexed: Set<string>;
  private readonly logger: Logger;

  constructor(entryRepository: EntryRepository, datastoreFactory: DatastoreFactory, logger: Logger) {
    this.entryRepository = entryRepository;
    this.logger = logger;
    this.entriesToBeIndexed = datastoreFactory.set(Keys.EntriesToBeIndexed, DataType.String);
  }

  import(source: EntrySource): Promise<void> {
    return AsyncEnumerable.from(source)
      .buffer(BUFFER_SIZE)
      .parallelForEach(CONCURRENCY, async (batch) => {
        const ids = batch.map((entry) => entry.id);

        await this.entryRepository.saveMany(batch);
        await this.entriesToBeIndexed.addMany(ids);

        this.logger.verbose(`imported ${ids.length} entries`);
      });
  }
}
