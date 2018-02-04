import * as Redis from 'ioredis';

import { DatastoreProvider, DataType, Set } from '../';
import { uniqueID } from '../../utils/unique-id';
import { RedisKey } from './key';
import { RedisMap } from './map';
import { RedisSet } from './set';


interface RedisDatastoreConstructable<TInstance> {
  new(redis: Redis.Redis, key: string, dataType: DataType): TInstance;
}

export class RedisDatastoreProvider implements DatastoreProvider {
  private readonly redis: Redis.Redis;

  constructor(redis: Redis.Redis) {
    this.redis = redis;
  }

  getUniqueKey(): string {
    return 'unnamed:' + uniqueID();
  }

  construct<TInstance, TValue>(constructor: RedisDatastoreConstructable<TInstance>, keyOrDataType: string | DataType, dataType?: DataType): TInstance {
    let key: string;

    if (typeof keyOrDataType != 'string') {
      key = this.getUniqueKey();
      dataType = keyOrDataType;
    } else {
      key = `datastore:${keyOrDataType}`;
    }

    return new constructor(this.redis, key, dataType as DataType);
  }

  key<T>(dataType: DataType): RedisKey<T>;
  key<T>(key: string, dataType: DataType): RedisKey<T>;
  key<T>(keyOrDataType: string | DataType, dataType?: DataType): RedisKey<T> {
    return this.construct(RedisKey, keyOrDataType, dataType) as RedisKey<T>;
  }

  set<T>(dataType: DataType): Set<T>;
  set<T>(key: string, dataType: DataType): Set<T>;
  set<T>(keyOrDataType: string | DataType, dataType?: DataType): Set<T> {
    return this.construct(RedisSet, keyOrDataType, dataType) as RedisSet<T>;
  }

  map<T>(dataType: DataType): RedisMap<T>;
  map<T>(key: string, dataType: DataType): RedisMap<T>;
  map<T>(keyOrDataType: string | DataType, dataType?: DataType): RedisMap<T> {
    return this.construct(RedisMap, keyOrDataType, dataType) as RedisMap<T>;
  }
}
