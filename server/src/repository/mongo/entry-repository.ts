import * as Mongo from 'mongodb';

import { EntryRepository } from '../';
import { Entry, Document } from '../../common/model';
import { MongoBaseRepository } from './base-repository';
import { InsertedMongoDocument } from './mongo-document';
import { AnyIterable } from '../../common/utils/index';
import { AsyncEnumerable } from '../../common/enumerable/index';

export class MongoEntryRepository implements EntryRepository {
  private readonly collection: Mongo.Collection<InsertedMongoDocument<Entry>>;
  private readonly baseRepository: MongoBaseRepository<Entry>;

  constructor(collection: Mongo.Collection<InsertedMongoDocument<Entry>>) {
    this.collection = collection;
    this.baseRepository = new MongoBaseRepository(collection);
  }

  save(entry: Entry): Promise<Document<Entry>> {
    return this.baseRepository.save(entry, entry.id);
  }

  saveMany(entries: Entry[]): Promise<Document<Entry>[]> {
    const saveItems = entries.map((entry) => ({ item: entry, id: entry.id }));

    return this.baseRepository.saveMany(saveItems);
  }

  load(id: string): Promise<Document<Entry> | null> {
    return this.baseRepository.load(id);
  }

  loadMany(ids: AnyIterable<string>): AsyncIterable<Document<Entry>> {
    return this.baseRepository.loadMany(ids);
  }
}
