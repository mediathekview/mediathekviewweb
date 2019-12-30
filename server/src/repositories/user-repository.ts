import { EntityRepository } from '@tstdl/database';
import { User } from '../common/models/user';

export interface UserRepository extends EntityRepository<User> {
}
