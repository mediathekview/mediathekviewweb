import * as Redis from 'ioredis';
import { DataType } from '../data-type';
import { Key } from '../key';
import { DeserializeFunction, getDeserializer, getSerializer, SerializeFunction } from './serializer';

export class RedisKey<T> implements Key<T> {
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

  async set(value: T): Promise<void> {
    const serialized = this.serialize(value);
    await this.redis.set(this.key, serialized);
  }

  async get(): Promise<T | undefined> {
    const result = await this.redis.get(this.key);

    if (result == undefined) {
      return undefined;
    }

    const value = this.deserialize(result);
    return value;
  }

  async exists(): Promise<boolean> {
    const result = await this.redis.exists(this.key);
    return result == 1;
  }

  async delete(): Promise<boolean> {
    const result = await (this.redis as any).unlink(this.key);
    return result == 1;
  }
}
