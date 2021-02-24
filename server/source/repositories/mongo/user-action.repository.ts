import type { UserAction } from '$shared/models/core/user-actions.model';
import type { Logger } from '@tstdl/base/logger';
import type { Collection, TypedIndexSpecification } from '@tstdl/mongo';
import { MongoEntityRepository, noopTransformer } from '@tstdl/mongo';
import type { UserActionRepository } from '../user-action.repository';

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
