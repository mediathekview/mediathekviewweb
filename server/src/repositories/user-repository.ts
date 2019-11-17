import { EntityRepository } from '@common-ts/database';
import { User } from '../common/models/user';

export interface UserRepository extends EntityRepository<User> {
}
