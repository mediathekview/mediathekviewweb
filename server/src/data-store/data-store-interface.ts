import { IBag, ISet } from './';

export interface IDataStore {
  getBag<T>(key: string): IBag<T>;
  getSet<T>(key: string): ISet<T>;
}
