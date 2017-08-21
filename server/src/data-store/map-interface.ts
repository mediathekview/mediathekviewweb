import { ITransactable, ISortedSet } from './';
import { Nullable } from '../utils';

export type MapEntry<T> = { key: string, value: T };

export interface IMap<T> extends ITransactable {
  key: string;

  set(map: Map<string, T> | [[string, T]], sortedSetCondition?: { set: ISortedSet<any>, greaterThan?: number, lessThan?: number }): Promise<void>;
  get(key: string): Promise<Nullable<T>>;
  getMany(...keys: string[]): Promise<MapEntry<Nullable<T>>[]>;
  getAll(): Promise<MapEntry<T>[]>;
  exists(key: string): Promise<boolean>;
  delete(...fields: string[]): Promise<number>;
}
