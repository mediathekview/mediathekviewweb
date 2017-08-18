import { IDatastoreProvider, IMap, ITransaction, ISet, IKey } from '../';
import { RedisSet, RedisMap, RedisKey, RedisTransaction } from './';
import { getUniqueID } from '../../utils';
import * as Redis from 'ioredis';

export class RedisDatastoreProvider implements IDatastoreProvider {
  private redis: Redis.Redis;

  constructor(host: string, port: number, db: number) {
    this.redis = Redis(port, host, { db: db });
  }

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
