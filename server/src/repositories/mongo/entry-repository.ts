import { AsyncEnumerable } from '@tstdl/base/enumerable';
import { Collection, MongoBaseRepository, MongoDocument, toMongoDocument, TypedIndexSpecification } from '@tstdl/mongo';
import * as Mongo from 'mongodb';
import { Entry, Field } from '../../common/models';
import { EntryRepository } from '../entry-repository';

const indexes: TypedIndexSpecification<Entry>[] = [
  { key: { [Field.FirstSeen]: 1 } },
  { key: { [Field.LastSeen]: 1 } }
];

export class MongoEntryRepository implements EntryRepository {
  private readonly collection: Collection<Entry>;
  private readonly baseRepository: MongoBaseRepository<Entry>;

  constructor(collection: Collection<Entry>) {
    this.collection = collection;
    this.baseRepository = new MongoBaseRepository(collection);
  }

  async initialize(): Promise<void> {
    await this.collection.createIndexes(indexes, {});
  }

  async save(entry: Entry): Promise<void> {
    const { updateOne: { filter, update, upsert } } = toUpdateOneOperation(entry);
    await this.collection.updateOne(filter, update, { upsert });
  }

  async saveMany(entries: Entry[]): Promise<void> {
    const operations = entries.map(toUpdateOneOperation);
    await this.collection.bulkWrite(operations, { ordered: false });
  }

  async load(id: string): Promise<Entry> {
    return this.baseRepository.load(id);
  }

  async loadMany(ids: string[]): Promise<Entry[]> {
    return this.baseRepository.loadManyById(ids);
  }
}

// tslint:disable-next-line: typedef
function toUpdateOneOperation(entry: Entry) {
  const filter: Mongo.FilterQuery<MongoDocument<Entry>> = {
    _id: entry.id
  };

  const { lastSeen, firstSeen, ...documentWithoutFirstAndLastSeen } = toMongoDocument(entry);

  const update: Mongo.UpdateQuery<MongoDocument<Entry>> = {
    $max: { lastSeen },
    $min: { firstSeen },
    $set: { ...documentWithoutFirstAndLastSeen }
  };

  const operation = {
    updateOne: {
      filter,
      update,
      upsert: true
    }
  };

  return operation;
}
