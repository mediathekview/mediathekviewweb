import { User, UserWithPartialId } from '../common/model/user';
import { AnyIterable } from '../common/utils';

export interface UserRepository {
  save(user: UserWithPartialId): Promise<User>;
  saveMany(users: AnyIterable<UserWithPartialId>): AsyncIterable<User>;

  load(id: string): Promise<User | null>;
  loadMany(ids: AnyIterable<string>): AsyncIterable<User>;

  drop(): Promise<void>;
}
