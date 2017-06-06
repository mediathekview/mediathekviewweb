import { ISet } from './';
import { RedisService } from '../redis-service';

export class RedisSet<T> implements ISet<T> {
  redis: RedisService;
  key: string;

  constructor(key: string) {
    this.redis = RedisService.getInstance();
    this.key = key;
  }

  async add(...items: T[]): Promise<number> {
    let serializedItems = items.map((item) => JSON.stringify(item));
    return this.redis.sadd(this.key, serializedItems);
  }

  has(item: T): Promise<boolean> {
    return this.redis.sismember(this.key, JSON.stringify(item));
  }

  async remove(...items: T[]): Promise<number> {
    let serializedItems = items.map((item) => JSON.stringify(item));
    return this.redis.srem(this.key, serializedItems);
  }

  async pop(count: number = 1): Promise<T[]> {
    let items = await this.redis.spop(this.key, count);
    return items.map((item) => JSON.parse(item) as T);
  }
}
