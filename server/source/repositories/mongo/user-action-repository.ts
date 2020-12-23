import { Logger } from '@tstdl/base/logger';
import { Collection, MongoEntityRepository, noopTransformer, TypedIndexSpecification } from '@tstdl/mongo';
import { UserAction } from '$shared/models/core/user-actions.model';
import { UserActionRepository } from '../user-action-repository';

const indexes: TypedIndexSpecification<UserAction>[] = [
  { name: 'actionType', key: { actionType: 1 } },
  { name: 'userId', key: { userId: 1 } },
  { name: 'visitId', key: { visitId: 1 } },
  { name: 'pageViewId', key: { pageViewId: 1 } },
  { name: 'route', key: { route: 1 } }
];

export class MongoUserActionRepository extends MongoEntityRepository<UserAction> implements UserActionRepository {
  constructor(collection: Collection<UserAction>, logger: Logger) {
    super(collection, noopTransformer, { indexes, logger });
  }
}
