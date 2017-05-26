import { IDataStore, IBag, ISet, RedisBag, RedisSet } from './';

export class RedisDataStore implements IDataStore {
  getBag<T>(key: string): IBag<T> {
    return new RedisBag<T>(key);
  }

  getSet<T>(key: string): ISet<T> {
    return new RedisSet<T>(key);
  }
}
