import { Collection, MongoDocument, MongoEntityRepository, TypedIndexSpecification } from '@tstdl/mongo';
import { UserAction, UserActionFilter } from '../../common/models/user-actions';
import { UserActionRepository } from '../user-action-repository';

const indexes: TypedIndexSpecification<UserActionFilter>[] = [
  { key: { actionType: 1 } },
  { key: { userId: 1 } },
  { key: { visitId: 1 } },
  { key: { pageViewId: 1 } },
  { key: { route: 1 } }
];

export class MongoUserActionRepository extends MongoEntityRepository<UserAction> implements UserActionRepository {
  constructor(collection: Collection<MongoDocument<UserAction>>) {
    super(collection, { indexes });
  }
}
