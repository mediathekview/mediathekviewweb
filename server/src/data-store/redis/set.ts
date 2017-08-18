import { ISet, ITransaction } from '../';
import { RedisTransaction } from './';
import * as Redis from 'ioredis';

export class RedisSet<T> implements ISet<T> {
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

  add(...members: T[]): Promise<number> {
    const serializedMembers = members.map((member) => JSON.stringify(member));
    return this.redisOrPipeline.sadd(this.key, ...members);
  }

  has(member: T): Promise<boolean> {
    this.throwOnTransacting();
    const serializedMember = JSON.stringify(member);
    return this.redis.sismember(this.key, serializedMember);
  }

  remove(...members: T[]): Promise<number> {
    const serializedMembers = members.map((member) => JSON.stringify(member));
    return this.redisOrPipeline.srem(this.key, ...serializedMembers);
  }

  async members(): Promise<T[]> {
    this.throwOnTransacting();
    const serializedMembers: string[] = await this.redis.smembers(this.key);
    return serializedMembers.map((serializedMember) => JSON.parse(serializedMember));
  }

  async pop(count: number): Promise<T[]> {
    this.throwOnTransacting();
    const serializedMembers: string[] = this.redis.spop(this.key, count);
    return serializedMembers.map((serializedMember) => JSON.parse(serializedMember));
  }

  size(): Promise<number> {
    this.throwOnTransacting();
    return this.redis.scard(this.key);
  }

  async delete(): Promise<boolean> {
    const result = await (this.redisOrPipeline as any).unlink(this.key);
    return result == 1;
  }

  intersect(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number> {
    const setKeys = [this, ...sets].map((set) => set.key);
    return this.redisOrPipeline.sinterstore(destination.key, ...setKeys);
  }

  union(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number> {
    const setKeys = [this, ...sets].map((set) => set.key);
    return this.redisOrPipeline.sunionstore(destination.key, ...setKeys);
  }

  diff(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number> {
    const setKeys = [this, ...sets].map((set) => set.key);
    return this.redisOrPipeline.sdiffstore(destination.key, ...setKeys);
  }

  clone(destination: ISet<T>): Promise<void> {
    return this.redisOrPipeline.sunionstore(destination.key, this.key);
  }
}
