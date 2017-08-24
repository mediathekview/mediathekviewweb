import { IMap, MapEntry, ISortedSet, ITransaction } from '../';
import { RedisTransaction } from './';
import { Nullable } from '../../utils';
import * as Redis from 'ioredis';

export class RedisMap<T> implements IMap<T> {
  private transacting: boolean = false;
  private redisOrPipeline: Redis.Redis | Redis.Pipeline;

  key: string;

  constructor(key: string, private redis: Redis.Redis) {
    this.key = key;
    this.redisOrPipeline = redis;
  }

  transact(transaction: ITransaction) {
    if (!(transaction instanceof RedisTransaction)) {
      throw new Error('transaction must be a RedisTransaction')
    }

    this.transacting = true;
    this.redisOrPipeline = (transaction as RedisTransaction).pipeline;
  }

  endTransact() {
    this.transacting = false;
    this.redisOrPipeline = this.redis;
  }

  private throwOnTransacting() {
    if (this.transacting) {
      throw new Error('Not supported while transacting. Call endTransact()');
    }
  }

  set(map: Map<string, T> | [[string, T]], sortedSetCondition?: { set: ISortedSet<any>, greaterThan?: number, lessThan?: number }): Promise<void> {
    const args: string[] = [];

    for (let entry of map) {
      const serialized = JSON.stringify(entry[1]);

      args.push(entry[0], serialized);
    }

    if (sortedSetCondition != undefined) {
      let condition;
      let conditionValue;

      if (sortedSetCondition.greaterThan == undefined && typeof sortedSetCondition.lessThan == 'number') {
        condition = 'LESS';
        conditionValue = sortedSetCondition.lessThan;
      }
      else if (sortedSetCondition.lessThan == undefined && typeof sortedSetCondition.greaterThan == 'number') {
        condition = 'GREATER';
        conditionValue = sortedSetCondition.greaterThan;
      }
      else {
        throw new Error('either none or both conditions are set');
      }

      return this.redis['hmsetSortedSetCondition'](this.key, sortedSetCondition.set.key, condition, conditionValue, ...args);
    } else {
      return this.redisOrPipeline.hmset(this.key, ...args);
    }
  }

  async get(key: string): Promise<Nullable<T>> {
    this.throwOnTransacting();

    const result = await this.redis.hget(this.key, key) as string | null;

    if (result == null) {
      return null;
    }

    return JSON.parse(result);
  }

  async getMany(...keys: string[]): Promise<MapEntry<Nullable<T>>[]> {
    this.throwOnTransacting();

    if (keys.length == 0) {
      return [];
    }

    const results = await this.redis.hmget(this.key, ...keys) as (string | null)[];

    const items: MapEntry<Nullable<T>>[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const value = result != null ? JSON.parse(result) : null;
      const entry: MapEntry<Nullable<T>> = { key: keys[i], value: value };

      items.push(entry);
    }

    return items;
  }

  async getAll(): Promise<MapEntry<T>[]> {
    this.throwOnTransacting();

    const result = await this.redis.hgetall(this.key);

    const items: MapEntry<T>[] = [];

    for (const property in result) {
      const value = JSON.parse(result[property]);
      const entry: MapEntry<T> = { key: property, value: value };

      items.push(entry);
    }

    return items;
  }

  async exists(key: string): Promise<boolean> {
    this.throwOnTransacting();

    const result = await this.redis.hexists(this.key, key);
    return result == 1;
  }

  delete(...fields: string[]): Promise<number> {
    return this.redis.hdel(this.key, ...fields);
  }
}
