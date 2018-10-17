import * as Redis from 'ioredis';

import { DataType, Set } from '../';
import { AsyncEnumerable } from '../../common/enumerable';
import { AnyIterable, Nullable } from '../../common/utils';
import { BATCH_SIZE, CONCURRENCY } from './constants';
import { SerializeFunction, getSerializer, getDeserializer, DeserializeFunction } from './serializer';
import { SortedSet, SortedSetItem, SortedSetRankedItem } from '../sorted-set';
import { Serializer } from '../../common/serializer';

type ConvertedSortedSetItem = {
  serializedValue: string,
  score: string
};

type Converter<T> = (item: SortedSetItem<T>, serialize: SerializeFunction<T>) => ConvertedSortedSetItem;

function formatScore(score: number): string {
  if (score == Number.POSITIVE_INFINITY) {
    return '+inf';
  }

  if (score == Number.NEGATIVE_INFINITY) {
    return '-inf';
  }

  if (Number.isNaN(score)) {
    throw new Error('NaN is not a valid value for score');
  }

  return score.toString();
}

function convertSortedSetItem<T>(item: SortedSetItem<T>, serialize: SerializeFunction<T>): ConvertedSortedSetItem {
  const score = formatScore(item.score);
  const serializedValue = serialize(item.value);

  return { score, serializedValue };
}

function convertToScoreMemberArgs<T>(items: SortedSetItem<T>[], convert: (item: SortedSetItem<T>) => ConvertedSortedSetItem): string[] {
  const args: string[] = [];

  for (const item of items) {
    const { score, serializedValue } = convert(item);
    args.push(score, serializedValue);
  }

  return args;
}

export class RedisSortedSet<T> implements SortedSet<T> {
  private readonly redis: Redis.Redis;
  private readonly key: string;

  private serialize: SerializeFunction<T>;
  private deserialize: DeserializeFunction<T>;
  private convert: (item: SortedSetItem<T>) => ConvertedSortedSetItem;

  constructor(redis: Redis.Redis, key: string, dataType: DataType, serializer: Serializer) {
    this.key = key;
    this.redis = redis;

    this.serialize = getSerializer(dataType, serializer);
    this.deserialize = getDeserializer(dataType, serializer);
    this.convert = (item) => convertSortedSetItem(item, this.serialize);
  }

  async add(item: SortedSetItem<T>): Promise<void> {
    const { score, serializedValue } = this.convert(item);
    await this.redis.zadd(this.key, score, serializedValue);
  }

  async addMany(items: AnyIterable<SortedSetItem<T>>): Promise<void> {
    await AsyncEnumerable.from(items)
      .batch(BATCH_SIZE)
      .map((batch) => convertToScoreMemberArgs(batch, this.convert))
      .parallelForEach(3, async (args) => {
        await this.redis.zadd(this.key, ...args);
      });
  }

  getScore(value: T): Promise<SortedSetItem<T>> {
    throw new Error("Method not implemented.");
  }

  getScoreMany(values: AnyIterable<T>): AsyncIterable<SortedSetItem<T>> {
    throw new Error("Method not implemented.");
  }
  getRank(value: T): Promise<SortedSetRankedItem<T>> {
    throw new Error("Method not implemented.");
  }
  getRankReversed(value: T): Promise<SortedSetRankedItem<T>> {
    throw new Error("Method not implemented.");
  }
  getRankMany(values: AnyIterable<T>): AsyncIterable<SortedSetRankedItem<T>> {
    throw new Error("Method not implemented.");
  }
  getRankManyReversed(values: AnyIterable<T>): AsyncIterable<SortedSetRankedItem<T>> {
    throw new Error("Method not implemented.");
  }
  has(value: T): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  hasMany(values: AnyIterable<T>): AsyncIterable<boolean> {
    throw new Error("Method not implemented.");
  }
  delete(value: T): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  deleteMany(values: AnyIterable<T>): Promise<number> {
    throw new Error("Method not implemented.");
  }
  deleteByRank(rank: number): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  deleteManyByRank(rank: number): Promise<number> {
    throw new Error("Method not implemented.");
  }
  deleteByScore(minScore: number, maxScore: number): Promise<number> {
    throw new Error("Method not implemented.");
  }
  increaseScore(value: T, increment: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  popMin(): Promise<Undefinable<SortedSetItem<T>>>;
  popMin(count: number): Promise<SortedSetItem<T>[]>;
  popMin(count?: any) {
    throw new Error("Method not implemented.");
  }
  popMax(): Promise<Undefinable<SortedSetItem<T>>>;
  popMax(count: number): Promise<SortedSetItem<T>[]>;
  popMax(count?: any) {
    throw new Error("Method not implemented.");
  }
  popAll(batchCount: number): AsyncIterable<T> {
    throw new Error("Method not implemented.");
  }
  count(): Promise<number>;
  count(minScore: number, maxScore: number): Promise<number>;
  count(minScore?: any, maxScore?: any) {
    throw new Error("Method not implemented.");
  }
  values(): AsyncIterable<SortedSetItem<T>> {
    throw new Error("Method not implemented.");
  }
  valuesByScore(minScore: number, maxScore: number): AsyncIterable<SortedSetItem<T>> {
    throw new Error("Method not implemented.");
  }
  valuesByScoreReversed(minScore: number, maxScore: number): AsyncIterable<SortedSetItem<T>> {
    throw new Error("Method not implemented.");
  }
  valuesByRank(minRank: number, maxRank: number): AsyncIterable<SortedSetItem<T>> {
    throw new Error("Method not implemented.");
  }
  valuesByRankReversed(minRank: number, maxRank: number): AsyncIterable<SortedSetItem<T>> {
    throw new Error("Method not implemented.");
  }
  clear(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}