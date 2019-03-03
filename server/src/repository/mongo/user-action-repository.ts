import * as Mongo from 'mongodb';
import { UserAction, UserActionFilter, UserActionWithPartialId } from '../../common/model/user-actions';
import { objectToDotNotation } from '../../common/utils';
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

  async insert(action: UserActionWithPartialId): Promise<UserAction> {
    return this.baseRepository.insert(action);
  }

  async insertMany(actions: UserActionWithPartialId[]): Promise<UserAction[]> {
    return this.baseRepository.insertMany(actions);
  }

  async load(id: string): Promise<UserAction | undefined> {
    return this.baseRepository.load(id);
  }

  loadManyById(ids: string[]): AsyncIterable<UserAction> {
    return this.baseRepository.loadManyById(ids);
  }

  loadManyByFilter(filter: UserActionFilter): AsyncIterable<UserAction> {
    const dotNotatedFilter = objectToDotNotation(filter);
    return this.baseRepository.loadManyByFilter(dotNotatedFilter);
  }

  async drop(): Promise<void> {
    return this.baseRepository.drop();
  }
}
