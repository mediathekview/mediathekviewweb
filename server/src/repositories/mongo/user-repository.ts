import { Collection, MongoEntityRepository } from '@common-ts/mongo';
import { User } from '../../common/models';
import { UserRepository } from '../user-repository';

export class MongoUserRepository extends MongoEntityRepository<User> implements UserRepository {
  constructor(collection: Collection<User>) {
    super(collection);
  }
}
