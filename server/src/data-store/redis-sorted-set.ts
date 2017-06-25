import { ISet, ISortedSet, ISortedSetMember, AggregationMode } from './';
import { RedisService } from '../redis-service';
import { Utils } from '../utils';

export class RedisSortedSet<T> implements ISortedSet<T> {
  redis: RedisService;
  key: string;

  constructor(key: string) {
    this.redis = RedisService.getInstance();
    this.key = key;
  }

  async add(...members: T[]): Promise<number> {
    let serializedItems = members.map((item) => ({ member: JSON.stringify(item), score: 0 }));
    return this.redis.zadd(this.key, serializedItems);
  }

  async addWithScore(...members: ISortedSetMember<T>[]): Promise<number> {
    let serializedItems: ISortedSetMember<string>[] = members.map((item) => { return { member: JSON.stringify(item.member), score: item.score } });

    return this.redis.zadd(this.key, serializedItems);
  }

  async has(item: T): Promise<boolean> {
    let score = await this.redis.zscore(this.key, JSON.stringify(item));
    return score != null;
  }

  async remove(...members: T[]): Promise<number> {
    let serializedItems = members.map((item) => JSON.stringify(item));
    return this.redis.zrem(this.key, ...serializedItems);
  }

  async pop(count: number = 1): Promise<T[]> {
    let members = await this.redis.zpop(this.key, false, count);
    return members.map((item) => JSON.parse(item.member) as T);
  }

  async popWithScore(count: number = 1): Promise<ISortedSetMember<T>[]> {
    let members = await this.redis.zpop(this.key, true, count);
    return members.map((item) => ({ member: JSON.parse(item.member), score: item.score }));
  }

  async size(): Promise<number> {
    return this.redis.zcard(this.key);
  }

  async flush(): Promise<boolean> {
    return this.redis.del(this.key);
  }

  async intersect(destination: ISortedSet<T>, sets: (ISet<T> | ISortedSet<T>)[], options?: { weights?: number[], aggregationMode?: AggregationMode }): Promise<number> {
    let keys = sets.map((set) => set.key);
    return this.redis.zinterstore(destination.key, [this.key, ...keys], options);
  }

  async union(destination: ISortedSet<T>, sets: (ISet<T> | ISortedSet<T>)[], options?: { weights?: number[], aggregationMode?: AggregationMode }): Promise<number> {
    let keys = sets.map((set) => set.key);
    return this.redis.zunionstore(destination.key, [this.key, ...keys], options);
  }

  async diff(destination: ISortedSet<T>, sets: (ISet<T> | ISortedSet<T>)[]): Promise<number> {
    let keys = sets.map((set) => set.key);
    return this.redis.zdiffstore(destination.key, [this.key, ...keys]);
  }

  async move(destination: ISortedSet<T>): Promise<void> {
    if (await this.size() > 0) {
      await Promise.all([
        this.union(destination, []),
        this.flush()
      ]);
    }
  }
}
