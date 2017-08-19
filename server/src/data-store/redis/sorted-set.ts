import { ISortedSet, SortedSetMember, ISet, ITransaction, AggregationMode } from '../';
import { RedisTransaction } from './';
import { Nullable } from '../../utils';
import * as Redis from 'ioredis';

export class RedisSortedSet<T> implements ISortedSet<T> {
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

  add(...members: SortedSetMember<T>[]): Promise<number> {
    const args: (number | string)[] = [];

    for (let member of members) {
      const serialized = JSON.stringify(member.key);
      args.push(member.score, serialized);
    }

    return this.redisOrPipeline.zadd(this.key, ...args);
  }

  async has(member: T): Promise<boolean> {
    const score = await this.score(member);

    return score != null;
  }


  async score(member: T): Promise<Nullable<number>> {
    this.throwOnTransacting();
    const serializedMember = JSON.stringify(member);
    return this.redis.zscore(this.key, serializedMember);
  }

  remove(...members: T[]): Promise<number> {
    const serializedMembers = members.map((member) => JSON.stringify(member));
    return this.redisOrPipeline.zrem(this.key, ...serializedMembers);
  }

  async members(): Promise<SortedSetMember<T>[]> {
    this.throwOnTransacting();
    const result: (string | number)[] = await this.redis.zrange(this.key, 0, -1, 'WITHSCORES');

    const members: SortedSetMember<T>[] = [];

    for (let i = 0; i < result.length; i += 1) {
      const member: SortedSetMember<T> = {
        key: JSON.parse(result[i] as string) as T,
        score: result[i + 1] as number
      }

      members.push(member);
    }

    return members;
  }

  size(): Promise<number> {
    this.throwOnTransacting();
    return this.redis.zcard(this.key);
  }

  async delete(): Promise<boolean> {
    const result = await (this.redisOrPipeline as any).unlink(this.key);
    return result == 1;
  }

  intersect(destination: ISortedSet<T>, mode: AggregationMode, ...sets: (ISet<T> | ISortedSet<T>)[]): Promise<number> {
    const setKeys = [this, ...sets].map((set) => set.key);
    return this.redisOrPipeline.zinterstore(destination.key, setKeys.length, ...setKeys, 'AGGREGATE', AggregationMode[mode].toUpperCase());
  }

  union(destination: ISortedSet<T>, mode: AggregationMode, ...sets: (ISet<T> | ISortedSet<T>)[]): Promise<number> {
    const setKeys = [this, ...sets].map((set) => set.key);
    return this.redisOrPipeline.zunionstore(destination.key, setKeys.length, ...setKeys, 'AGGREGATE', AggregationMode[mode].toUpperCase());
  }

  /*diff(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number> {
    const setKeys = [this, ...sets].map((set) => set.key);
    return this.redisOrPipeline.sdiffstore(destination.key, ...setKeys);
  }*/

  clone(destination: ISortedSet<T>): Promise<void> {
    return this.redisOrPipeline.zunionstore(destination.key, 1, this.key);
  }
}
