import type { User } from '$shared/models/core';
import { MongoEntityRepository } from '@tstdl/mongo';
import type { UserRepository } from '../user.repository';

export class MongoUserRepository extends MongoEntityRepository<User> implements UserRepository { }
