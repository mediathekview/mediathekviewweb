import { UserAction, UserActionFilter, UserActionWithPartialId } from '../common/model/user-actions';

export interface UserActionRepository {
  insert(action: UserActionWithPartialId): Promise<UserAction>;
  insertMany(actions: UserActionWithPartialId[]): Promise<UserAction[]>;

  load(id: string): Promise<UserAction | undefined>;
  loadManyById(ids: string[]): AsyncIterable<UserAction>;
  loadManyByFilter(filter: Partial<UserActionFilter>): AsyncIterable<UserAction>;

  drop(): Promise<void>;
}
