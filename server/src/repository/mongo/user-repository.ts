import * as Mongo from 'mongodb';

import { UserRepository } from '../';
import { User, UserWithPartialId } from '../../common/model';
import { AnyIterable } from '../../common/utils';
import { MongoBaseRepository } from './base-repository';
import { MongoDocument } from './mongo-document';

export class MongoUserRepository implements UserRepository {
  private readonly collection: Mongo.Collection<MongoDocument<User>>;
  private readonly baseRepository: MongoBaseRepository<User>;

  constructor(collection: Mongo.Collection<MongoDocument<User>>) {
    this.collection = collection;
    this.baseRepository = new MongoBaseRepository(collection);
  }

  save(user: UserWithPartialId): Promise<User> {
    return this.baseRepository.save(user);
  }

  saveMany(users: AnyIterable<UserWithPartialId>): AsyncIterable<User> {
    return this.baseRepository.saveMany(users);
  }

  load(id: string): Promise<User | null> {
    return this.baseRepository.load(id);
  }

  loadMany(ids: AnyIterable<string>): AsyncIterable<User> {
    return this.baseRepository.loadManyById(ids);
  }

  drop(): Promise<void> {
    return this.baseRepository.drop();
  }
}
