import { EntityRepository } from '@common-ts/database';
import { UserAction } from '../common/models/user-actions';

export interface UserActionRepository extends EntityRepository<UserAction> {
}
