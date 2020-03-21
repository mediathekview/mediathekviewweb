import { EntityRepository } from '@tstdl/database';
import { UserAction } from '../common/models/user-actions';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserActionRepository extends EntityRepository<UserAction> {
}
