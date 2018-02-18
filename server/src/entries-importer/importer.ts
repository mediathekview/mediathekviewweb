import { AsyncEnumerable } from '../common/enumerable/async-enumerable';
import { DatastoreFactory, DataType, Set } from '../datastore';
import { EntrySource } from '../entry-source';
import { Keys } from '../keys';
import { EntryRepository } from '../repository/entry-repository';

const BUFFER_SIZE = 10;
const CONCURRENCY = 3;

export class EntriesImporter {
  private readonly entryRepository: EntryRepository;
  private readonly entriesToBeIndexed: Set<string>;

  constructor(entryRepository: EntryRepository, datastoreFactory: DatastoreFactory) {
    this.entryRepository = entryRepository;
    this.entriesToBeIndexed = datastoreFactory.set(Keys.EntriesToBeIndexed, DataType.String);
  }

  import(source: EntrySource): Promise<void> {
    return AsyncEnumerable
      .buffer(source, BUFFER_SIZE)
      .parallelForEach(CONCURRENCY, async (batch) => {
        const ids = batch.map((entry) => entry.id);

        await this.entryRepository.saveMany(batch);
        await this.entriesToBeIndexed.addMany(ids);
      });
  }
}
