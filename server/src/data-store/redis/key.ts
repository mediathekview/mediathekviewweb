import { IKey } from '../';
import * as Redis from 'ioredis';

export class RedisKey<T> implements IKey<T> {
  key: string;

  constructor(key: string, private redis: Redis.Redis) {
    this.key = key;
  }

  async get(): Promise<T> {
    const result = await this.redis.get(this.key);
    return JSON.parse(result);
  }

  async set(value: T): Promise<void> {
    const serialized = JSON.stringify(value);
    return this.redis.set(this.key, serialized);
  }

  async increment(increment: number = 1, threatAsFloat: boolean = false): Promise<number> {
    if (threatAsFloat) {
      return this.redis.incrbyfloat(this.key, increment);
    }

    return this.redis.incrby(this.key, increment);
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
