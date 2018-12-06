import * as Redis from 'ioredis';
import { DataType, Entry, Map } from '../';
import { AsyncEnumerable } from '../../common/enumerable/async-enumerable';
import { Nullable } from '../../common/utils';
import { AnyIterable } from '../../common/utils/any-iterable';
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

  set(keyOrIterable: string | AnyIterable<Entry<T>>, value?: T): Promise<void> {
    if (typeof keyOrIterable == 'string') {
      return this.setKeyValue(keyOrIterable, value as T);
    }

    return this.setMany(keyOrIterable);
  }

  get(): AsyncIterable<Entry<T>>;
  get(key: string): Promise<Undefinable<T>>;
  get(iterable: AnyIterable<string>): AsyncIterable<Undefinable<T>>;
  get(keyOrIterable?: string | AnyIterable<string>): AsyncIterable<Entry<T>> | AsyncIterable<Undefinable<T>> | Promise<Undefinable<T>> {
    if (keyOrIterable == undefined) {
      return this.getAll();
    } else if (typeof keyOrIterable == 'string') {
      return this.getKey(keyOrIterable);
    } else {
      return this.getKeys(keyOrIterable);
    }
  }

  has(key: string): Promise<boolean>;
  has(iterable: AnyIterable<string>): AsyncIterable<boolean>;
  has(keyOrIterable: string | AnyIterable<string>): Promise<boolean> | AsyncIterable<boolean> {
    if (typeof keyOrIterable == 'string') {
      return this.hasKey(keyOrIterable);
    } else {
      return this.hasKeys(keyOrIterable);
    }
  }

  delete(key: string): Promise<number>;
  delete(iterable: AnyIterable<string>): Promise<number>;
  async delete(keyOrIterable: string | AnyIterable<string>): Promise<number> {
    if (typeof keyOrIterable == 'string') {
      return this.redis.hdel(this.key, keyOrIterable);
    }
    else {
      const keys = await AsyncEnumerable.from(keyOrIterable).toArray();
      return this.redis.hdel(this.key, ...keys);
    }
  }

  async count(): Promise<number> {
    return this.redis.hlen(this.key);
  }

  async clear(): Promise<void> {
    await (this.redis as any).unlink(this.key);
  }

  private async setKeyValue(key: string, value: T): Promise<void> {
    const serialized = this.serialize(value);
    await this.redis.hmset(this.key, key, serialized);
  }

  private async setMany(iterable: AnyIterable<Entry<T>>): Promise<void> {
    await AsyncEnumerable.from(iterable)
      .map((entry) => this.setManySerialize(entry))
      .batch(BATCH_SIZE)
      .map((batch) => new Map(batch))
      .parallelForEach(3, async (map) => {
        await this.redis.hmset(this.key, map);
      });
  }

  private setManySerialize(entry: Entry<T>): [string, string] {
    const serialized = this.serialize(entry.value);
    return [entry.key, serialized];
  }

  private async *getAll(): AsyncIterable<Entry<T>> {
    const result = await this.redis.hgetall(this.key) as string[];

    for (let i = 0; i < result.length; i += 2) {
      const key = result[i];
      const serialized = result[i + 1];
      const value = this.deserialize(serialized);

      yield { key, value };
    }
  }

  private async getKey(key: string): Promise<Undefinable<T>> {
    const result = await this.redis.hget(this.key, key) as Nullable<string>;

    if (result == null) {
      return undefined;
    }

    const value = this.deserialize(result);
    return value;
  }

  private async *getKeys(iterable: AnyIterable<string>): AsyncIterable<Undefinable<T>> {
    const keys = await AsyncEnumerable.from(iterable).toArray();
    const result = await this.redis.hmget(this.key, ...keys) as Nullable<string>[];

    for (const item of result) {
      if (item == null) {
        yield undefined;
        continue;
      }

      const value = this.deserialize(item);
      yield value;
    }
  }

  private async hasKey(key: string): Promise<boolean> {
    const result = await this.redis.hexists(this.key, key);
    return result == 1;
  }

  private async *hasKeys(iterable: AnyIterable<string>): AsyncIterable<boolean> {
    const batches = AsyncEnumerable.from(iterable)
      .batch(BATCH_SIZE);

    for await (const batch of batches) {
      const transaction = this.redis.multi();

      for (const key of batch) {
        transaction.hexists(this.key, key);
      }

      const results = await transaction.exec() as [Nullable<Error>, 1 | 0][];

      for (const result of results) {
        const [error, exists] = result;

        if (error != null) {
          throw error;
        }

        yield exists == 1;
      }
    }
  }
}
