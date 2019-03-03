import * as Mongo from 'mongodb';
import { User, UserWithPartialId } from '../../common/model';
import { UserRepository } from '../user-repository';
import { MongoBaseRepository } from './base-repository';
import { MongoDocument } from './mongo-document';

export class MongoUserRepository implements UserRepository {
  private readonly collection: Mongo.Collection<MongoDocument<User>>;
  private readonly baseRepository: MongoBaseRepository<User>;

  constructor(collection: Mongo.Collection<MongoDocument<User>>) {
    this.collection = collection;
    this.baseRepository = new MongoBaseRepository(collection);
  }

  async insert(user: UserWithPartialId): Promise<User> {
    return this.baseRepository.insert(user);
  }

  async insertMany(users: UserWithPartialId[]): Promise<User[]> {
    return this.baseRepository.insertMany(users);
  }

  async load(id: string): Promise<User | undefined> {
    return this.baseRepository.load(id);
  }

  loadMany(ids: string[]): AsyncIterable<User> {
    return this.baseRepository.loadManyById(ids);
  }

  async drop(): Promise<void> {
    return this.baseRepository.drop();
  }
}
