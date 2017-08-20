import { ITransactable, ISortedSet } from './';
import { Nullable } from '../utils';

export interface IMap<T> extends ITransactable {
  key: string;

  set(map: Map<string, T> | [[string, T]], sortedSetCondition?: { set: ISortedSet<any>, greaterThan?: number, lessThan?: number }): Promise<void>;
  get(key: string): Promise<Nullable<T>>;
  getAll(): Promise<Map<string, T>>;
  exists(key: string): Promise<boolean>;
  delete(...fields: string[]): Promise<number>;
}
