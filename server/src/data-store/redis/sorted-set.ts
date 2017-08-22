import { ISortedSet, SortedSetMember, ISet, ITransaction, Aggregation } from '../';
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

  add(members: SortedSetMember<T>[], options?: { trackingSet?: ISet<T>, aggregation?: Aggregation }): Promise<number> {
    const scoreMembers: (number | string)[] = [];

    for (let member of members) {
      const serialized = JSON.stringify(member.key);
      scoreMembers.push(member.score, serialized);
    }

    if (options != undefined && (options.aggregation != null || options.trackingSet != undefined)) {
      const keysCount = options.trackingSet != undefined ? 2 : 1;
      const args = [keysCount, this.key];

      if (options.trackingSet != undefined) {
        args.push(options.trackingSet.key);
      }

      if (options.aggregation != undefined) {
        args.push('AGGREGATE', Aggregation[options.aggregation].toUpperCase());
      }

      return this.redisOrPipeline['zaddExtended'](...args, ...scoreMembers);
    } else {
      return this.redisOrPipeline.zadd(this.key, ...scoreMembers);
    }
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

  private async _range(options: {
    byRank?: { start: number, stop: number },
    byScore?: { min: number, minInclusive: boolean, max: number, maxInclusive: boolean },
    reverse: boolean
  }) {
    let func: (...args: any[]) => Promise<[string, number]>;
    const args: any[] = [this.key];

    if (options.byRank) {
      func = (...args: any[]) => options.reverse ? this.redis.zrevrange(...args) : this.redis.zrange(...args);
      args.push(options.byRank.start, options.byRank.stop);
    }
    else if (options.byScore) {
      func = (...args: any[]) => options.reverse ? this.redis.zrevrangebyscore(...args) : this.redis.zrangebyscore(...args);

      const min = (options.byScore.minInclusive ? '' : '(') + ((options.byScore.min == Number.POSITIVE_INFINITY) ? '+inf' : ((options.byScore.min == Number.NEGATIVE_INFINITY) ? '-inf' : options.byScore.min));
      const max = (options.byScore.maxInclusive ? '' : '(') + ((options.byScore.max == Number.POSITIVE_INFINITY) ? '+inf' : ((options.byScore.max == Number.NEGATIVE_INFINITY) ? '-inf' : options.byScore.max));

      args.push(min, max);
    }
    else {
      throw new Error('neither byRank nor byScore set');
    }

    args.push('WITHSCORES');

    const result = await func(...args);

    const members: SortedSetMember<T>[] = [];

    for (let i = 0; i < result.length; i += 2) {
      const member: SortedSetMember<T> = {
        key: JSON.parse(result[i] as string) as T,
        score: parseFloat(result[i + 1] as string)
      }

      members.push(member);
    }

    return members;
  }

  async range(start: number, stop: number, reverse: boolean): Promise<SortedSetMember<T>[]> {
    this.throwOnTransacting();

    return this._range({ byRank: { start: start, stop: stop }, reverse: reverse });
  }

  async rangeByScore(min: number, minInclusive: boolean, max: number, maxInclusive: boolean, reverse: boolean): Promise<SortedSetMember<T>[]> {
    this.throwOnTransacting();

    return this._range({ byScore: { min: min, minInclusive: minInclusive, max: max, maxInclusive: maxInclusive }, reverse: reverse });
  }

  async members(): Promise<SortedSetMember<T>[]> {
    this.throwOnTransacting();

    return this._range({ byRank: { start: 0, stop: -1 }, reverse: false });
  }

  size(): Promise<number> {
    this.throwOnTransacting();
    return this.redis.zcard(this.key);
  }

  async delete(): Promise<boolean> {
    const result = await (this.redisOrPipeline as any).unlink(this.key);
    return result == 1;
  }

  intersect(destination: ISortedSet<T>, mode: Aggregation, ...sets: (ISet<T> | ISortedSet<T>)[]): Promise<number> {
    const setKeys = [this, ...sets].map((set) => set.key);
    return this.redisOrPipeline.zinterstore(destination.key, setKeys.length, ...setKeys, 'AGGREGATE', Aggregation[mode].toUpperCase());
  }

  union(destination: ISortedSet<T>, mode: Aggregation, ...sets: (ISet<T> | ISortedSet<T>)[]): Promise<number> {
    const setKeys = [this, ...sets].map((set) => set.key);
    return this.redisOrPipeline.zunionstore(destination.key, setKeys.length, ...setKeys, 'AGGREGATE', Aggregation[mode].toUpperCase());
  }

  /*diff(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number> {
    const setKeys = [this, ...sets].map((set) => set.key);
    return this.redisOrPipeline.sdiffstore(destination.key, ...setKeys);
  }*/

  clone(destination: ISortedSet<T>): Promise<void> {
    return this.redisOrPipeline.zunionstore(destination.key, 1, this.key);
  }
}
