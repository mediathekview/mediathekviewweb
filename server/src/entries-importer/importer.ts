import { EntrySource } from '../entry-source';
import { EntryRepository } from '../repository/entry-repository';
import { AsyncEnumerable } from '../common/enumerable/async-enumerable';
import { Entry } from '../common/model';
import { DatastoreProvider, DataType, Set } from '../datastore';
import { Keys } from '../keys';

const BUFFER_SIZE = 10;
const CONCURRENCY = 3;

export class EntriesImporter {
  private readonly entryRepository: EntryRepository;
  private readonly entriesToBeIndexed: Set<string>;

  constructor(entryRepository: EntryRepository, datastoreProvider: DatastoreProvider) {
    this.entryRepository = entryRepository;
    this.entriesToBeIndexed = datastoreProvider.set(Keys.EntriesToBeIndexed, DataType.String);
  }

  async import(source: EntrySource) {
    AsyncEnumerable
      .buffer(source, BUFFER_SIZE)
      .parallelForEach(CONCURRENCY, async (entries) => {
        const ids = entries.map((entry) => entry.id);

        await this.entryRepository.saveMany(entries);
        await this.entriesToBeIndexed.addMany(ids);
      });
  }
}