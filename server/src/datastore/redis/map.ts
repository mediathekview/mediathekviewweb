import * as Redis from 'ioredis';
import { AsyncEnumerable } from '../../common/enumerable/async-enumerable';
import { DataType } from '../data-type';
import { Entry, Map } from '../map';
import { DeserializeFunction, getDeserializer, getSerializer, SerializeFunction } from './serializer';

const BATCH_SIZE = 100;

export class RedisMap<T> implements Map<T> {
  private readonly key: string;
  private readonly redis: Redis.Redis;
  private readonly serialize: SerializeFunction<T>;
  private readonly deserialize: DeserializeFunction<T>;

  constructor(redis: Redis.Redis, key: string, dataType: DataType) {
    this.redis = redis;
    this.key = key;

    this.serialize = getSerializer(dataType);
    this.deserialize = getDeserializer(dataType);
  }

  async set(key: string, value: T): Promise<void> {
    const serialized = this.serialize(value);
    await this.redis.hmset(this.key, key, serialized);
  }

  async setMany(entries: Entry<T>[]): Promise<void> {
    await AsyncEnumerable.from(entries)
      .map((entry) => this.setManySerialize(entry))
      .batch(BATCH_SIZE)
      .map((batch) => new Map(batch))
      .forEach(async (map) => this.redis.hmset(this.key, map));
  }

  async get(key: string): Promise<T | undefined> {
    const result = await this.redis.hget(this.key, key);

    if (result == undefined) {
      return undefined;
    }

    const value = this.deserialize(result);
    return value;
  }

  async *getMany(keys: string[]): AsyncIterable<T | undefined> {
    const result = await this.redis.hmget(this.key, ...keys) as (string | null)[];

    for (const item of result) {
      if (item == undefined) {
        yield undefined;
        continue;
      }

      const value = this.deserialize(item);
      yield value;
    }
  }

  async *getAll(): AsyncIterable<Entry<T>> {
    const result = await this.redis.hgetall(this.key) as string[];

    for (let i = 0; i < result.length; i += 2) {
      const key = result[i];
      const serialized = result[i + 1];
      const value = this.deserialize(serialized);

      yield { key, value };
    }
  }

  async has(key: string): Promise<boolean> {
    const result = await this.redis.hexists(this.key, key);
    return result == 1;
  }

  hasMany(keys: string[]): AsyncIterable<boolean> {
    return this.hasKeys(keys);
  }

  async delete(key: string): Promise<boolean> {
    const count = await this.redis.hdel(this.key, key) as number;
    return count == 1;
  }

  async deleteMany(keys: string[]): Promise<number> {
    return this.redis.hdel(this.key, ...keys) as Promise<number>;
  }

  async count(): Promise<number> {
    return this.redis.hlen(this.key);
  }

  async clear(): Promise<void> {
    await (this.redis as any).unlink(this.key);
  }

  private setManySerialize(entry: Entry<T>): [string, string] {
    const serialized = this.serialize(entry.value);
    return [entry.key, serialized];
  }

  private async *hasKeys(keys: string[]): AsyncIterable<boolean> {
    const batches = AsyncEnumerable.from(keys)
      .batch(BATCH_SIZE);

    for await (const batch of batches) { // tslint:disable-line: await-promise
      const pipeline = this.redis.pipeline();

      for (const key of batch) {
        pipeline.hexists(this.key, key);
      }

      const results = await pipeline.exec() as [Error | null, 1 | 0][];

      for (const result of results) {
        const [error, exists] = result;

        if (error != undefined) {
          throw error;
        }

        yield exists == 1;
      }
    }
  }
}
