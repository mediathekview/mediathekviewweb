import { ISet, ISortedSet, SortedSetItem } from './';
import { RedisService } from '../redis-service';
import { Utils } from '../utils';

export class RedisSet<T> implements ISortedSet<T> {
  redis: RedisService;
  key: string;

  constructor(key: string) {
    this.redis = RedisService.getInstance();
    this.key = key;
  }

  async add(items: T[] | T): Promise<number> {
    items = Utils.arrayize(items);
    let serializedItems = items.map((item) => JSON.stringify(item));
    return this.redis.sadd(this.key, serializedItems);
  }

  async addWithScore(items: SortedSetItem<T>[] | SortedSetItem<T>): Promise<number> {
    items = Utils.arrayize(items);
    let serializedItems: SortedSetItem<string>[] = items.map((item) => { return { member: JSON.stringify(item), score: item.score } });

    let scoresAndMembers = serializedItems.reduce((arr, item) => {
      arr.push(item.score, item.member);
      return arr;
    }, []);

    return this.redis.zadd(this.key, scoresAndMembers);
  }

  has(item: T): Promise<boolean> {
    return this.redis.sismember(this.key, JSON.stringify(item));
  }

  async remove(items: T[] | T): Promise<number> {
    items = Utils.arrayize(items);
    let serializedItems = items.map((item) => JSON.stringify(item));
    return this.redis.srem(this.key, serializedItems);
  }

  async pop(count: number = 1): Promise<T[]> {
    let items = await this.redis.spop(this.key, count);
    return items.map((item) => JSON.parse(item) as T);
  }

  async popWithScore(count: number = 1): Promise<SortedSetItem<T>[]> {
    
    let items = await this.redis.zrange(this.key, count);
    return items.map((item) => JSON.parse(item) as T);
  }

  async size(): Promise<number> {
    return this.redis.scard(this.key);
  }

  async flush(): Promise<boolean> {
    return this.redis.del(this.key);
  }

  async intersect(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number> {
    let keys = sets.map((set) => set.key);
    return this.redis.sinterstore(destination.key, this.key, ...keys);
  }

  async union(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number> {
    let keys = sets.map((set) => set.key);
    return this.redis.sunionstore(destination.key, this.key, ...keys);
  }

  async diff(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number> {
    let keys = sets.map((set) => set.key);
    return this.redis.sdiffstore(destination.key, this.key, ...keys);
  }

  async move(destination: ISet<T>): Promise<void> {
    let promises: Promise<any>[] = [
      destination.flush()
    ];

    if (await this.size() > 0) {
      promises.push(this.union(destination));
      promises.push(this.flush());
    }

    await Promise.all(promises);
  }
}
