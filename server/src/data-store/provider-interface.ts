import { ISet, IKey } from './';

export interface IDatastoreProvider {
  getKey<T>(key?: string): IKey<T>;
  getSet<T>(key?: string): ISet<T>;
}
