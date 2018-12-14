import { User, UserWithPartialId } from '../common/model/user';
import { AnyIterable } from '../common/utils';

export interface UserRepository {
  save(user: UserWithPartialId): Promise<User>;
  saveMany(users: AnyIterable<UserWithPartialId>): Promise<User[]>;

  load(id: string): Promise<User | null>;
  loadMany(ids: string[]): AsyncIterable<User>;

  drop(): Promise<void>;
}
