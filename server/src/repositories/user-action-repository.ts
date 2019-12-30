import { EntityRepository } from '@tstdl/database';
import { UserAction } from '../common/models/user-actions';

export interface UserActionRepository extends EntityRepository<UserAction> {
}
