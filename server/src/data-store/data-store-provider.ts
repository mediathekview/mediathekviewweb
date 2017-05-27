import { IDataStore, IBag, ISet, RedisDataStore, RedisBag, RedisSet } from './';

export class DataStoreProvider {
  static getDataStore(): IDataStore {
    return new RedisDataStore();
  }
}
