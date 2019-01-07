import { User, UserWithPartialId } from '../common/model/user';

export interface UserRepository {
  save(user: UserWithPartialId): Promise<User>;
  saveMany(users: UserWithPartialId[]): Promise<User[]>;

  load(id: string): Promise<User | undefined>;
  loadMany(ids: string[]): AsyncIterable<User>;

  drop(): Promise<void>;
}
