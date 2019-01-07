import { Nullable } from '../common/utils';

export type SortedSetItem<T> = {
  value: T;
  score: number;
};

export type SortedSetRankedItem<T> = {
  value: T;
  rank: number;
};

export interface SortedSet<T> {
  add(item: SortedSetItem<T>): Promise<void>;
  addMany(items: Array<SortedSetItem<T>>): Promise<void>;

  getScore(value: T): Promise<Undefinable<number>>;
  getScoreMany(values: T[]): Nullable<SortedSetItem<T>>;
  getRank(value: T): Promise<Undefinable<number>>;
  getRankReversed(value: T): Promise<Undefinable<number>>;
  getRankMany(values: T[]): Array<SortedSetRankedItem<T>>;
  getRankManyReversed(values: T[]): Array<SortedSetRankedItem<T>>;

  has(value: T): Promise<boolean>;
  hasMany(values: T[]): AsyncIterable<boolean>;

  delete(value: T): Promise<boolean>;
  deleteMany(values: T[]): Promise<number>;
  deleteByRank(rank: number): Promise<boolean>;
  deleteManyByRank(rank: number): Promise<number>;
  deleteByScore(minScore: number, maxScore: number): Promise<number>;

  increaseScore(value: T, increment: number): Promise<void>;

  popMin(): Promise<Undefinable<SortedSetItem<T>>>;
  popMin(count: number): Promise<Array<SortedSetItem<T>>>;
  popMax(): Promise<Undefinable<SortedSetItem<T>>>;
  popMax(count: number): Promise<Array<SortedSetItem<T>>>;

  popAll(batchCount: number): AsyncIterable<T>;

  count(): Promise<number>;
  count(minScore: number, maxScore: number): Promise<number>;

  values(): AsyncIterable<SortedSetItem<T>>;
  valuesByScore(minScore: number, maxScore: number): AsyncIterable<SortedSetItem<T>>;
  valuesByScoreReversed(minScore: number, maxScore: number): AsyncIterable<SortedSetItem<T>>;
  valuesByRank(minRank: number, maxRank: number): AsyncIterable<SortedSetItem<T>>;
  valuesByRankReversed(minRank: number, maxRank: number): AsyncIterable<SortedSetItem<T>>;

  clear(): Promise<void>;
}
