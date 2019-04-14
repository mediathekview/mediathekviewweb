import { EntityRepository } from '@common-ts/database';
import { User } from '../common/model/user';

export interface UserRepository extends EntityRepository<User> {
}
