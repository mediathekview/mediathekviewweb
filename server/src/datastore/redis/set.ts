import { AsyncEnumerable } from '@common-ts/base/enumerable';
import * as Redis from 'ioredis';
import { DataType } from '../data-type';
import { Set } from '../set';
import { BATCH_SIZE } from './constants';
import { DeserializeFunction, getDeserializer, getSerializer, SerializeFunction } from './serializer';

const popAllBatchSize = 50;

export class RedisSet<T> implements Set<T> {
  private readonly redis: Redis.Redis;
  private readonly key: string;
  private readonly serialize: SerializeFunction<T>;
  private readonly deserialize: DeserializeFunction<T>;

  constructor(redis: Redis.Redis, key: string, dataType: DataType) {
    this.key = key;
    this.redis = redis;

    this.serialize = getSerializer(dataType);
    this.deserialize = getDeserializer(dataType);
  }

  async add(value: T): Promise<void> {
    const serialized = this.serialize(value);
    await this.redis.sadd(this.key, serialized);
  }

  async addMany(iterable: T[]): Promise<void> {
    await AsyncEnumerable.from(iterable)
      .map(this.serialize)
      .batch(BATCH_SIZE)
      .parallelForEach(3, async (batch) => {
        await this.redis.sadd(this.key, ...batch);
      });
  }

  async has(value: T): Promise<boolean> {
    const serialized = this.serialize(value);
    const result = await this.redis.sismember(this.key, serialized);

    return result == 1;
  }

  hasMany(iterable: T[]): AsyncIterable<boolean> {
    return AsyncEnumerable.from(iterable)
      .map(this.serialize)
      .batch(BATCH_SIZE)
      .map(async (batch) => this.hasPipeline(batch))
      .mapMany((results) => results);
  }

  async delete(value: T): Promise<void> {
    const serialized = this.serialize(value);
    await this.redis.srem(serialized);
  }

  async deleteMany(iterable: T[]): Promise<void> {
    return AsyncEnumerable.from(iterable)
      .map(this.serialize)
      .batch(BATCH_SIZE)
      .forEach(async (batch) => this.redis.srem(this.key, ...batch));
  }

  async pop(): Promise<T | undefined> {
    const serialized = await this.redis.spop(this.key) as string;

    throw new Error('spop response needs to be verified');

    // const result = this.deserialize(serialized);
    // return result;
  }

  async popMany(count: number): Promise<T[]> {
    const serialized = await this.redis.spop(this.key, count) as string[];
    const values = serialized.map(this.deserialize);

    return values;
  }

  async *popAll(): AsyncIterable<T> {
    while (true) {
      const items = await this.popMany(popAllBatchSize);

      if (items.length == 0) {
        return;
      }

      yield* items;
    }
  }

  async *values(): AsyncIterable<T> {
    const serialized = await this.redis.smembers(this.key) as string[];
    const values = serialized.map(this.deserialize);

    yield* values;
  }

  async count(): Promise<number> {
    const result = await this.redis.scard(this.key);
    return result;
  }

  async clear(): Promise<void> {
    await (this.redis as any).unlink(this.key);
  }

  private async hasPipeline(batch: string[]): Promise<boolean[]> {
    const pipeline = this.redis.pipeline();

    batch.forEach((value) => pipeline.sismember(this.key, value));

    const response = await pipeline.exec() as [Error | null, 0 | 1][];

    const result = response.map(([error, result]) => {
      if (error != undefined) {
        throw error;
      }

      return result == 1;
    });

    return result;
  }
}
