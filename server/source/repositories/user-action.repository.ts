import { EntityRepository } from '@tstdl/database';
import { UserAction } from '$shared/models/core/user-actions.model';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserActionRepository extends EntityRepository<UserAction> {
}
