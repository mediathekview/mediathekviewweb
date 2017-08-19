import { ISet, ISortedSet, IMap, IKey, ITransaction } from './';

export interface IDatastoreProvider {
  getKey<T>(key?: string): IKey<T>;
  getSet<T>(key?: string): ISet<T>;
  getSortedSet<T>(key?:string):ISortedSet<T>;
  getMap<T>(key?: string): IMap<T>;

  getTransaction(): ITransaction;
}
