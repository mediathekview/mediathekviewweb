import { IDataStore, IBag, RedisBag } from './';

export class RedisDataStore implements IDataStore<string> {
  getBag<T>(namespace: string): IBag<T, string> {
    return new RedisBag<T>(namespace);
  }
}
