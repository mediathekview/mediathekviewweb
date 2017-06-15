import { ISet } from './set-interface';

export type SortedSetItem<T> = { member: T, score: number };

export enum AggregationMode {
  Min,
  Max,
  Sum
}

export interface ISortedSet<T> {
  key: string;

  add(items: T[] | T): Promise<number>;
  addWithScore(items: SortedSetItem<T>[] | SortedSetItem<T>): Promise<number>;
  has(item: T): Promise<boolean>;
  remove(items: T[] | T): Promise<number>;
  pop(count: number): Promise<T[]>;
  popWithScore(count: number): Promise<SortedSetItem<T>[]>;
  size(): Promise<number>;
  flush(): Promise<boolean>;

  intersect(destination: ISortedSet<T>, sets: (ISet<T> | ISortedSet<T>)[], weights?: number[], aggregationMode?: AggregationMode): Promise<number>;
  union(destination: ISortedSet<T>, sets: (ISet<T> | ISortedSet<T>)[], weights?: number[], aggregationMode?: AggregationMode): Promise<number>;
  diff(destination: ISortedSet<T>, sets: (ISet<T> | ISortedSet<T>)[], weights?: number[], aggregationMode?: AggregationMode): Promise<number>;
  move(destination: ISortedSet<T>): Promise<void>;
}
