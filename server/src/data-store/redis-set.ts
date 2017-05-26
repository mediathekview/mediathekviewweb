import { ISet } from './';
import { RedisService } from '../redis-service';

export class RedisSet<T> implements ISet<T> {
  redis: RedisService;
  key: string;

  constructor(key: string) {
    this.redis = RedisService.getInstance();
    this.key = key;
  }

  async add(item: T): Promise<boolean> {
    return (await this.redis.sadd(this.key, item)) == 1;
  }

  has(item: T): Promise<boolean> {
    return this.redis.sismember(this.key, item);
  }

  async remove(item: T): Promise<boolean> {
    return (await this.redis.srem(this.key, item)) == 1;
  }
}
