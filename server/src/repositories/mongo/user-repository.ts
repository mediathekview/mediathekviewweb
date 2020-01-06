import { Collection, MongoEntityRepository, MongoDocument } from '@tstdl/mongo';
import { User } from '../../common/models';
import { UserRepository } from '../user-repository';

export class MongoUserRepository extends MongoEntityRepository<User> implements UserRepository {
  constructor(collection: Collection<MongoDocument<User>>) {
    super(collection);
  }
}
