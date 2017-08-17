import { IDatastoreProvider, ISet, IKey } from '../';
import { RedisSet, RedisKey } from './';
import * as Redis from 'ioredis';

export class RedisDatastoreProvider implements IDatastoreProvider {
  private redis: Redis.Redis;
  private counter = 0;
  private lastTimestamp: number = 0;

  constructor(host: string, port: number, db: number) {
    this.redis = Redis(port, host, { db: db });
  }

  private getUniqueKey(): string {
    const timestamp = Date.now();

    if (timestamp != this.lastTimestamp) {
      this.counter = 0;
      this.lastTimestamp = timestamp;
    }

    return `${process.pid}:${timestamp}:${this.counter++}`;
  }

  getKey<T>(key?: string): IKey<T> {
    if (key == undefined) {
      key = this.getUniqueKey();
    }

    return new RedisKey<T>(key, this.redis);
  }

  getSet<T>(key?: string): ISet<T> {
    if (key == undefined) {
      key = this.getUniqueKey();
    }

    return new RedisSet<T>(key, this.redis);
  }
}
