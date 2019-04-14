import { EntityRepository } from '@common-ts/database';
import { UserAction } from '../common/model/user-actions';

export interface UserActionRepository extends EntityRepository<UserAction> {
}
