import { Collection, MongoEntityRepository } from '@common-ts/mongo';
import { UserAction } from '../../common/model/user-actions';
import { UserActionRepository } from '../user-action-repository';

export class MongoUserActionRepository extends MongoEntityRepository<UserAction> implements UserActionRepository {
  constructor(collection: Collection<UserAction>) {
    super(collection);
  }
}
