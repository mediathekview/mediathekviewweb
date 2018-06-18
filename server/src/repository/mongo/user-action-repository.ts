import * as Mongo from 'mongodb';

import { UserAction, UserActionFilter, UserActionWithPartialId } from '../../common/model/user-actions';
import { AnyIterable } from '../../common/utils';
import { UserActionRepository } from '../user-action-repository';
import { MongoBaseRepository } from './base-repository';
import { MongoDocument } from './mongo-document';

export class MongoUserActionRepository implements UserActionRepository {
  private readonly collection: Mongo.Collection<MongoDocument<UserAction>>;
  private readonly baseRepository: MongoBaseRepository<UserAction>;

  constructor(collection: Mongo.Collection<MongoDocument<UserAction>>) {
    this.collection = collection;
    this.baseRepository = new MongoBaseRepository(collection);
  }

  save(action: UserActionWithPartialId): Promise<UserAction> {
    return this.baseRepository.save(action);
  }

  saveMany(actions: AnyIterable<UserActionWithPartialId>): AsyncIterable<UserAction> {
    return this.baseRepository.saveMany(actions);
  }

  load(id: string): Promise<UserAction | null> {
    return this.baseRepository.load(id);
  }

  loadManyById(ids: AnyIterable<string>): AsyncIterable<UserAction> {
    return this.baseRepository.loadManyById(ids);
  }

  loadManyByFilter(filter: Partial<UserActionFilter>): AsyncIterable<UserAction> {
    return this.baseRepository.loadManyByFilter(filter);
  }

  drop(): Promise<void> {
    return this.baseRepository.drop();
  }
}
