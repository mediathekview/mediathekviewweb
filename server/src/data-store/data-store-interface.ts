import { IBag } from './';

export interface IDataStore<T> {
  getBag<T2>(namespace: string): IBag<T2, T>;
}
