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
  addMany(items: SortedSetItem<T>[]): Promise<void>;

  getScore(value: T): Promise<number | undefined>;
  getScoreMany(values: T[]): SortedSetItem<T> | undefined;
  getRank(value: T): Promise<number | undefined>;
  getRankReversed(value: T): Promise<number | undefined>;
  getRankMany(values: T[]): SortedSetRankedItem<T>[];
  getRankManyReversed(values: T[]): SortedSetRankedItem<T>[];

  has(value: T): Promise<boolean>;
  hasMany(values: T[]): AsyncIterable<boolean>;

  delete(value: T): Promise<boolean>;
  deleteMany(values: T[]): Promise<number>;
  deleteByRank(rank: number): Promise<boolean>;
  deleteManyByRank(rank: number): Promise<number>;
  deleteByScore(minScore: number, maxScore: number): Promise<number>;

  increaseScore(value: T, increment: number): Promise<void>;

  popMin(): Promise<SortedSetItem<T> | undefined>;
  popMin(count: number): Promise<SortedSetItem<T>[]>;
  popMax(): Promise<SortedSetItem<T> | undefined>;
  popMax(count: number): Promise<SortedSetItem<T>[]>;

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
