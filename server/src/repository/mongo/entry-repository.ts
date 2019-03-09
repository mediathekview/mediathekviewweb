import * as Mongo from 'mongodb';
import { Entry, Field } from '../../common/model';
import { EntryRepository } from '../entry-repository';
import { MongoBaseRepository } from './base-repository';
import { MongoDocument, toMongoDocument } from './mongo-document';
import { TypedMongoFilter } from './mongo-query';

const indexes: Mongo.IndexSpecification[] = [
  { key: { [Field.FirstSeen]: 1 } },
  { key: { [Field.LastSeen]: 1 } }
];

export class MongoEntryRepository implements EntryRepository {
  private readonly collection: Mongo.Collection<MongoDocument<Entry>>;
  private readonly baseRepository: MongoBaseRepository<Entry>;

  constructor(collection: Mongo.Collection<MongoDocument<Entry>>) {
    this.collection = collection;
    this.baseRepository = new MongoBaseRepository(collection);
  }

  async initialize(): Promise<void> {
    await this.collection.createIndexes(indexes, {});
  }

  async save(entry: Entry): Promise<void> {
    const operation = toUpdateOneOperation(entry);
    await this.collection.updateOne(operation.updateOne.filter, operation.updateOne.update, { upsert: operation.updateOne.upsert });
  }

  async saveMany(entries: Entry[]): Promise<void> {
    const operations = entries.map(toUpdateOneOperation);
    await this.collection.bulkWrite(operations, { ordered: false });
  }

  async load(id: string): Promise<Entry> {
    return this.baseRepository.load(id);
  }

  async *loadMany(ids: string[]): AsyncIterable<Entry> {
    yield* this.baseRepository.loadManyById(ids);
  }

  async *added(timestamp: number): AsyncIterable<Entry> {
    throw new Error("Method not implemented.");
  }

  async *removed(timestamp: number): AsyncIterable<string> {
    throw new Error("Method not implemented.");
  }

  async drop(): Promise<void> {
    await this.baseRepository.drop();
  }
}

// tslint:disable-next-line: typedef
function toUpdateOneOperation(entry: Entry) {
  const filter: TypedMongoFilter<Entry> = {
    _id: entry.id
  };

  const { lastSeen, firstSeen, ...documentWithoutFirstLastSeen } = toMongoDocument(entry);

  const update: Mongo.UpdateQuery<MongoDocument<Entry>> = {
    $max: { lastSeen },
    $min: { firstSeen },
    $set: { ...documentWithoutFirstLastSeen }
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
