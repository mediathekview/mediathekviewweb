import * as Mongo from 'mongodb';

import { EntryRepository } from '../';
import { Entry } from '../../common/model';
import { AnyIterable } from '../../common/utils';
import { MongoBaseRepository } from './base-repository';
import { MongoDocument, toMongoDocument, toEntity } from './mongo-document';
import { MongoFilter } from './mongo-query';

export class MongoEntryRepository implements EntryRepository {
  private readonly collection: Mongo.Collection<MongoDocument<Entry>>;
  private readonly baseRepository: MongoBaseRepository<Entry>;

  constructor(collection: Mongo.Collection<MongoDocument<Entry>>) {
    this.collection = collection;
    this.baseRepository = new MongoBaseRepository(collection);
  }

  save(entry: Entry): Promise<Entry> {
    return this.baseRepository.save(entry);
  }

  saveMany(entries: Entry[]): AsyncIterable<Entry> {
    return this.baseRepository.saveMany(entries);
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
}
