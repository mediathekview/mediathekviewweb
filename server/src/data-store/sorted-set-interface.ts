import { ITransactable, ISet } from './';
import { Nullable } from '../utils';

export enum AggregationMode {
  Sum,
  Min,
  Max
}

export type SortedSetMember<T> = {
  key: T;
  score: number;
}

export interface ISortedSet<T> extends ITransactable {
  key: string;

  add(...members: SortedSetMember<T>[]): Promise<number>;
  has(member: T): Promise<boolean>;
  remove(...members: T[]): Promise<number>;
  members(): Promise<SortedSetMember<T>[]>;
  score(member: T): Promise<Nullable<number>>;
  size(): Promise<number>;
  delete(): Promise<boolean>;

  intersect(destination: ISortedSet<T>, mode: AggregationMode, ...sets: (ISet<T> | ISortedSet<T>)[]): Promise<number>;
  union(destination: ISortedSet<T>, mode: AggregationMode, ...sets: (ISet<T> | ISortedSet<T>)[]): Promise<number>;
  //diff(destination: ISortedSet<T>, ...sets: (ISet<T> | ISortedSet<T>)[]): Promise<number>;
  clone(destination: ISortedSet<T>): Promise<void>;
}
