import * as Mongo from 'mongodb';
import { Entry } from '../../common/model';
import { EntryRepository } from '../entry-repository';
import { MongoBaseRepository } from './base-repository';
import { MongoDocument, toMongoDocument } from './mongo-document';
import { TypedMongoFilter } from './mongo-query';

export class MongoEntryRepository implements EntryRepository {
  private readonly collection: Mongo.Collection<MongoDocument<Entry>>;
  private readonly baseRepository: MongoBaseRepository<Entry>;

  constructor(collection: Mongo.Collection<MongoDocument<Entry>>) {
    this.collection = collection;
    this.baseRepository = new MongoBaseRepository(collection);
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

  loadMany(ids: string[]): AsyncIterable<Entry> {
    return this.baseRepository.loadManyById(ids);
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
