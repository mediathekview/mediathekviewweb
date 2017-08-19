import { IDatastoreProvider, IMap, ISortedSet, ITransaction, ISet, IKey } from '../';
import { RedisSet, RedisSortedSet, RedisMap, RedisKey, RedisTransaction } from './';
import { getUniqueID } from '../../utils';
import * as Redis from 'ioredis';

export class RedisDatastoreProvider implements IDatastoreProvider {
  constructor(private redis: Redis.Redis) { }

  getKey<T>(key?: string): IKey<T> {
    if (key == undefined) {
      key = getUniqueID();
    }

    return new RedisKey<T>(key, this.redis);
  }

  getSet<T>(key?: string): ISet<T> {
    if (key == undefined) {
      key = getUniqueID();
    }

    return new RedisSet<T>(key, this.redis);
  }

  getSortedSet<T>(key?: string): ISortedSet<T> {
    if (key == undefined) {
      key = getUniqueID();
    }

    return new RedisSortedSet<T>(key, this.redis);
  }

  getMap<T>(key?: string): IMap<T> {
    if (key == undefined) {
      key = getUniqueID();
    }

    return new RedisMap<T>(key, this.redis);
  }

  getTransaction(): ITransaction {
    return new RedisTransaction(this.redis.multi());
  }
}
