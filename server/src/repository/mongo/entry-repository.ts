import * as Mongo from 'mongodb';

import { EntryRepository } from '../';
import { AsyncEnumerable } from '../../common/enumerable';
import { Entry } from '../../common/model';
import { AnyIterable } from '../../common/utils';
import { MongoBaseRepository } from './base-repository';
import { MongoDocument, toMongoDocument } from './mongo-document';
import { TypedMongoFilter } from './mongo-query';

const BATCH_SIZE = 100;

export class MongoEntryRepository implements EntryRepository {
  private readonly collection: Mongo.Collection<MongoDocument<Entry>>;
  private readonly baseRepository: MongoBaseRepository<Entry>;

  constructor(collection: Mongo.Collection<MongoDocument<Entry>>) {
    this.collection = collection;
    this.baseRepository = new MongoBaseRepository(collection);
  }

  async save(entry: Entry): Promise<void> {
    const operation = this.toUpdateOneOperation(entry);
    await this.collection.updateOne(operation.updateOne.filter, operation.updateOne.update, { upsert: operation.updateOne.upsert });
  }

  async saveMany(entries: AnyIterable<Entry>): Promise<void> {
    await AsyncEnumerable.from(entries)
      .map((entry) => this.toUpdateOneOperation(entry))
      .batch(BATCH_SIZE)
      .forEach(async (operations) => await this.collection.bulkWrite(operations))
  }

  load(id: string): Promise<Entry | null> {
    return this.baseRepository.load(id);
  }

  loadMany(ids: AnyIterable<string>): AsyncIterable<Entry> {
    return this.baseRepository.loadManyById(ids);
  }

  drop(): Promise<void> {
    return this.baseRepository.drop();
  }

  private toUpdateOneOperation(entry: Entry) {
    const filter: TypedMongoFilter<Entry> = {
      _id: entry.id
    };

    const { lastSeen, firstSeen, ...documentWithoutLastSeen } = toMongoDocument(entry);

    const update: Mongo.UpdateQuery<MongoDocument<Entry>> = {
      $max: { lastSeen },
      $min: { firstSeen },
      $set: { ...documentWithoutLastSeen }
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
}
