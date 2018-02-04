import * as Redis from 'ioredis';

import { DataType, Set } from '../';
import { AsyncEnumerable, getEnumerable } from '../../common/enumerable';
import { AnyIterable, Nullable, Undefinable } from '../../common/utils';
import { BATCH_SIZE, CONCURRENCY } from './constants';
import { deserialize, serialize } from './serializer';

export class RedisSet<T> implements Set<T> {
  private readonly redis: Redis.Redis;
  private readonly key: string;
  private readonly dataType: DataType;

  constructor(redis: Redis.Redis, key: string, dataType: DataType) {
    this.key = key;
    this.redis = redis;
    this.dataType = dataType;
  }

  async add(value: T): Promise<void> {
    const serialized = serialize(value, this.dataType);
    await this.redis.sadd(this.key, serialized);
  }

  async addMany(iterable: AnyIterable<T>): Promise<void> {
    const enumerable = getEnumerable(iterable);
    const batches = enumerable.batch(BATCH_SIZE);

    for await (const batch of batches) {
      const serialized = batch.map((value) => serialize(value, this.dataType));
      await this.redis.sadd(this.key, ...serialized);
    }
  }

  async has(value: T): Promise<boolean> {
    const serialized = serialize(value, this.dataType);
    const result = await this.redis.sismember(this.key, serialized);

    return result == 1;
  }

  hasMany(iterable: AnyIterable<T>): AsyncIterable<boolean> {
    const enumerable = new AsyncEnumerable(iterable);

    const result = enumerable
      .batch(BATCH_SIZE)
      .map((batch) => batch.map((value) => serialize(value, this.dataType)))
      .parallelMap(3, true, (batch) => this.hasPipeline(batch))
      .mapMany((results) => results);

    return result;
  }

  async delete(value: T): Promise<void> {
    const serialized = serialize(value, this.dataType);
    await this.redis.srem(serialized);
  }

  deleteMany(iterable: AnyIterable<T>): Promise<void> {
    const enumerable = new AsyncEnumerable(iterable);

    return enumerable
      .batch(BATCH_SIZE)
      .map((batch) => batch.map((value) => serialize(value, this.dataType)))
      .parallelForEach(CONCURRENCY, async (batch) => {
        await this.redis.srem(this.key, ...batch);
      });
  }

  pop(): Promise<Undefinable<T>>;
  pop(count: number): AsyncIterable<T>;
  pop(count?: number): Promise<Undefinable<T>> | AsyncIterable<T> {
    let result: Promise<T> | AsyncIterable<T>;

    if (count == undefined) {
      result = this.popOne();
    } else {
      const popped = this.popMany(count);
      result = new AsyncEnumerable(popped);
    }

    return result;
  }

  async *values(): AsyncIterable<T> {
    const serialized: string[] = await this.redis.smembers(this.key);
    const values = serialized.map((value) => deserialize(value, this.dataType));

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

    const results = await pipeline.exec() as [Nullable<Error>, 0 | 1][];

    return results.map(([error, result]) => {
      if (error) {
        throw error;
      }

      return result == 1;
    });
  }

  private async popOne(): Promise<T> {
    const serialized = await this.redis.spop(this.key) as string;

    console.log('popOne response', serialized);

    const result = deserialize(serialized, this.dataType);

    return result;
  }

  private async *popMany(count: number): AsyncIterableIterator<T> {
    const serialized = await this.redis.spop(this.key, count) as string[];

    const values = serialized.map((value) => deserialize(value, this.dataType));

    yield* values;
  }
}
