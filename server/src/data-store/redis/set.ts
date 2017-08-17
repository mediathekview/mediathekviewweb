import { ISet } from '../';
import * as Redis from 'ioredis';

export class RedisSet<T> implements ISet<T> {
  key: string;

  constructor(key: string, private redis: Redis.Redis) {
    this.key = key;
  }

  add(...members: T[]): Promise<number> {
    const serializedMembers = members.map((member) => JSON.stringify(member));
    return this.redis.sadd(this.key, ...members);
  }

  has(member: T): Promise<boolean> {
    const serializedMember = JSON.stringify(member);
    return this.redis.sismember(this.key, serializedMember);
  }

  remove(...members: T[]): Promise<number> {
    const serializedMembers = members.map((member) => JSON.stringify(member));
    return this.redis.srem(this.key, ...serializedMembers);
  }

  async members(): Promise<T[]> {
    const serializedMembers: string[] = await this.redis.smembers(this.key);
    return serializedMembers.map((serializedMember) => JSON.parse(serializedMember));
  }

  async pop(count: number): Promise<T[]> {
    const serializedMembers: string[] = this.redis.spop(this.key, count);
    return serializedMembers.map((serializedMember) => JSON.parse(serializedMember));
  }

  size(): Promise<number> {
    return this.redis.scard(this.key);
  }

  async delete(): Promise<boolean> {
    const result = await (this.redis as any).unlink(this.key);
    return result == 1;
  }

  intersect(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number> {
    const setKeys = [this, ...sets].map((set) => set.key);
    return this.redis.sinterstore(destination.key, ...setKeys);
  }

  union(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number> {
    const setKeys = [this, ...sets].map((set) => set.key);
    return this.redis.sunionstore(destination.key, ...setKeys);
  }

  diff(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number> {
    const setKeys = [this, ...sets].map((set) => set.key);
    return this.redis.sdiffstore(destination.key, ...setKeys);
  }

  clone(destination: ISet<T>): Promise<void> {
    return this.redis.sunionstore(destination.key, this.key);
  }
}
