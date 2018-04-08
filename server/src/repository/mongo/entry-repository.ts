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
    const operation = this.toReplaceOneOperation(entry);
    await this.collection.replaceOne(operation.replaceOne.filter, operation.replaceOne.replacement, { upsert: operation.replaceOne.upsert });
  }

  async saveMany(entries: AnyIterable<Entry>): Promise<void> {
    await AsyncEnumerable.from(entries)
      .map(this.toReplaceOneOperation)
      .batch(BATCH_SIZE)
      .parallelForEach(3, async (operations) => await this.collection.bulkWrite(operations))
  }

  load(id: string): Promise<Entry | null> {
    return this.baseRepository.load(id);
  }

  loadMany(ids: AnyIterable<string>): AsyncIterable<Entry> {
    return this.baseRepository.loadMany(ids);
  }

  drop(): Promise<void> {
    return this.baseRepository.drop();
  }

  private toReplaceOneOperation(entry: Entry) {
    const filter: TypedMongoFilter<Entry> = {
      _id: entry.id,
      lastSeen: { $lte: entry.lastSeen },
    };

    const replacement = toMongoDocument(entry);

    const operation = {
      replaceOne: {
        filter,
        replacement,
        upsert: true
      }
    };

    return operation;
  }
}
