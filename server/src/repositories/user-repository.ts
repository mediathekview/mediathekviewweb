import { EntityRepository } from '@tstdl/database';
import { User } from '../common/models/user';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserRepository extends EntityRepository<User> {
}
