import * as Redis from 'ioredis';

import { DataType, Key } from '../';
import { Nullable } from '../../common/utils';
import { deserialize, serialize } from './serializer';

export class RedisKey<T> implements Key<T> {
  private readonly key: string;
  private readonly dataType: DataType;
  private readonly redis: Redis.Redis;

  constructor(redis: Redis.Redis, key: string, dataType: DataType) {
    this.redis = redis;
    this.key = key;
    this.dataType = dataType;
  }

  async set(value: T): Promise<void> {
    const serialized = serialize(value, this.dataType);
    await this.redis.set(this.key, serialized);
  }

  async get(): Promise<Undefinable<T>> {
    const result = await this.redis.get(this.key) as Nullable<string>;

    if (result == null) {
      return undefined;
    }

    const value = deserialize(result, this.dataType);
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
