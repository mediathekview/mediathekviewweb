import { Undefinable } from '../common/types';
import { AnyIterable } from '../common/utils';

export interface Set<T> {
  add(value: T): Promise<void>;
  addMany(iterable: AnyIterable<T>): Promise<void>;

  has(value: T): Promise<boolean>;
  hasMany(iterable: AnyIterable<T>): AsyncIterable<boolean>;

  delete(value: T): Promise<void>;
  deleteMany(iterable: AnyIterable<T>): Promise<void>;

  pop(): Promise<Undefinable<T>>;
  pop(count: number): Promise<T[]>;

  popAll(batchCount: number): AsyncIterable<T>;

  values(): AsyncIterable<T>;
  count(): Promise<number>;
  clear(): Promise<void>;
}
