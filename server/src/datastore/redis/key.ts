import * as Redis from 'ioredis';
import { DataType, Key } from '../';
import { Serializer } from '../../common/serializer';
import { Nullable } from '../../common/utils';
import { DeserializeFunction, getDeserializer, getSerializer, SerializeFunction } from './serializer';

export class RedisKey<T> implements Key<T> {
  private readonly key: string;
  private readonly redis: Redis.Redis;

  private readonly serialize: SerializeFunction<T>;
  private readonly deserialize: DeserializeFunction<T>;

  constructor(redis: Redis.Redis, key: string, dataType: DataType, serializer: Serializer) {
    this.redis = redis;
    this.key = key;

    this.serialize = getSerializer(dataType, serializer);
    this.deserialize = getDeserializer(dataType, serializer);
  }

  async set(value: T): Promise<void> {
    const serialized = this.serialize(value);
    await this.redis.set(this.key, serialized);
  }

  async get(): Promise<Undefinable<T>> {
    const result = await this.redis.get(this.key) as Nullable<string>;

    if (result == null) {
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
