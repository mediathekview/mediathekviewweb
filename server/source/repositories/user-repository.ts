import { EntityRepository } from '@tstdl/database';
import { User } from '$shared/models/core/user.model';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserRepository extends EntityRepository<User> {
}
