import { ITransactable, ISet } from './';
import { Nullable } from '../common/utils';

export enum Aggregation {
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

  add(members: SortedSetMember<T>[], options?: { trackingSet?: ISet<T>, aggregation?: Aggregation }): Promise<number>;
  has(member: T): Promise<boolean>;
  remove(...members: T[]): Promise<number>;
  range(start: number, stop: number, reverse: boolean): Promise<SortedSetMember<T>[]>;
  rangeByScore(min: number, minInclusive: boolean, max: number, maxInclusive: boolean, reverse: boolean): Promise<SortedSetMember<T>[]>;
  members(): Promise<SortedSetMember<T>[]>;
  score(member: T): Promise<Nullable<number>>;
  size(): Promise<number>;
  delete(): Promise<boolean>;

  intersect(destination: ISortedSet<T>, mode: Aggregation, ...sets: (ISet<T> | ISortedSet<T>)[]): Promise<number>;
  union(destination: ISortedSet<T>, mode: Aggregation, ...sets: (ISet<T> | ISortedSet<T>)[]): Promise<number>;
  //diff(destination: ISortedSet<T>, ...sets: (ISet<T> | ISortedSet<T>)[]): Promise<number>;
  clone(destination: ISortedSet<T>): Promise<void>;
}
