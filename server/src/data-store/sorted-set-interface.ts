import { ISet } from './set-interface';

export interface ISortedSetMember<T> {
  member: T;
  score: number;
}

export enum AggregationMode {
  Sum,
  Min,
  Max
}

export interface ISortedSet<T> {
  key: string;

  add(...members: T[]): Promise<number>;
  addWithScore(...members: ISortedSetMember<T>[]): Promise<number>;
  has(member: T): Promise<boolean>;
  remove(...members: T[]): Promise<number>;
  pop(count: number): Promise<T[]>;
  popWithScore(count: number): Promise<ISortedSetMember<T>[]>;
  size(): Promise<number>;
  flush(): Promise<boolean>;

  intersect(destination: ISortedSet<T>, sets: (ISet<T> | ISortedSet<T>)[], options?: { weights?: number[], aggregationMode?: AggregationMode }): Promise<number>;
  union(destination: ISortedSet<T>, sets: (ISet<T> | ISortedSet<T>)[], options?: { weights?: number[], aggregationMode?: AggregationMode }): Promise<number>;
  diff(destination: ISortedSet<T>, sets: (ISet<T> | ISortedSet<T>)[]): Promise<number>;
  move(destination: ISortedSet<T>): Promise<void>;
}
