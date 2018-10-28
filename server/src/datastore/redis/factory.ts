import * as Redis from 'ioredis';
import { DatastoreFactory, DataType, Set } from '../';
import { Serializer } from '../../common/serializer';
import { uniqueID } from '../../utils/unique-id';
import { RedisKey } from './key';
import { RedisMap } from './map';
import { RedisSet } from './set';

interface RedisDatastoreConstructable<TInstance> {
  new(redis: Redis.Redis, key: string, dataType: DataType, serializer: Serializer): TInstance;
}

export class RedisDatastoreFactory implements DatastoreFactory {
  private readonly redis: Redis.Redis;
  private readonly serializer: Serializer;

  constructor(redis: Redis.Redis, serializer: Serializer) {
    this.redis = redis;
    this.serializer = serializer;
  }

  key<T>(dataType: DataType): RedisKey<T>;
  key<T>(key: string, dataType: DataType): RedisKey<T>;
  key<T>(keyOrDataType: string | DataType, dataType?: DataType): RedisKey<T> {
    return this.construct(RedisKey, keyOrDataType, dataType, this.serializer) as RedisKey<any>;
  }

  set<T>(dataType: DataType): Set<T>;
  set<T>(key: string, dataType: DataType): Set<T>;
  set<T>(keyOrDataType: string | DataType, dataType?: DataType): Set<T> {
    return this.construct(RedisSet, keyOrDataType, dataType, this.serializer) as RedisSet<any>;
  }

  map<T>(dataType: DataType): RedisMap<T>;
  map<T>(key: string, dataType: DataType): RedisMap<T>;
  map<T>(keyOrDataType: string | DataType, dataType?: DataType): RedisMap<T> {
    return this.construct(RedisMap, keyOrDataType, dataType, this.serializer) as RedisMap<any>;
  }

  private construct<TInstance>(datastore: RedisDatastoreConstructable<TInstance>, keyOrDataType: string | DataType, dataType: DataType | undefined, serializer: Serializer): TInstance {
    let key: string;

    if (typeof keyOrDataType != 'string') {
      key = this.getUniqueKey();
      dataType = keyOrDataType;
    } else {
      key = `datastore:${keyOrDataType}`;
    }

    return new datastore(this.redis, key, dataType as DataType, serializer);
  }

  private getUniqueKey(): string {
    return 'unnamed:' + uniqueID();
  }
}
