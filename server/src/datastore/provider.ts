import { DataType } from './data-type';
import { Key } from './key';
import { Set } from './set';
import { Map } from './map';

export interface DatastoreProvider {
  key<T>(dataType: DataType): Key<T>;
  key<T>(key: string, dataType: DataType): Key<T>;

  set<T>(dataType: DataType): Set<T>;
  set<T>(key: string, dataType: DataType): Set<T>;

  map<T>(dataType: DataType): Map<T>;
  map<T>(key: string, dataType: DataType): Map<T>;
}