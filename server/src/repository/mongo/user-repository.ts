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

  async save(user: UserWithPartialId): Promise<User> {
    return await this.baseRepository.save(user);
  }

  async saveMany(users: UserWithPartialId[]): Promise<User[]> {
    return await this.baseRepository.saveMany(users);
  }

  async load(id: string): Promise<User | null> {
    return await this.baseRepository.load(id);
  }

  loadMany(ids: string[]): AsyncIterable<User> {
    return this.baseRepository.loadManyById(ids);
  }

  async drop(): Promise<void> {
    await this.baseRepository.drop();
  }
}
