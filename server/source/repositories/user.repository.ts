import type { User } from '$shared/models/core/user.model';
import type { EntityRepository } from '@tstdl/database';

export interface UserRepository extends EntityRepository<User> { }
