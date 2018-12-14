import { UserAction, UserActionFilter, UserActionWithPartialId } from '../common/model/user-actions';

export interface UserActionRepository {
  save(action: UserActionWithPartialId): Promise<UserAction>;
  saveMany(actions: UserActionWithPartialId[]): Promise<UserAction[]>;

  load(id: string): Promise<UserAction | null>;
  loadManyById(ids: string[]): AsyncIterable<UserAction>;
  loadManyByFilter(filter: Partial<UserActionFilter>): AsyncIterable<UserAction>;

  drop(): Promise<void>;
}
