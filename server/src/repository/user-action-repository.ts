import { UserAction, UserActionFilter, UserActionWithPartialId } from '../common/model/user-actions';
import { AnyIterable } from '../common/utils';

export interface UserActionRepository {
  save(action: UserActionWithPartialId): Promise<UserAction>;
  saveMany(actions: AnyIterable<UserActionWithPartialId>): AsyncIterable<UserAction>;

  load(id: string): Promise<UserAction | null>;
  loadManyById(ids: AnyIterable<string>): AsyncIterable<UserAction>;
  loadManyByFilter(filter: Partial<UserActionFilter>): AsyncIterable<UserAction>;

  drop(): Promise<void>;
}
