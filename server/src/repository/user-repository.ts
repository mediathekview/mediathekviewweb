import { User, UserWithPartialId } from '../common/model/user';

export interface UserRepository {
  insert(user: UserWithPartialId): Promise<User>;
  insertMany(users: UserWithPartialId[]): Promise<User[]>;

  load(id: string): Promise<User | undefined>;
  loadMany(ids: string[]): AsyncIterable<User>;

  drop(): Promise<void>;
}
