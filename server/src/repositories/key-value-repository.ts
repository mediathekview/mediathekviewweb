import { StringMap } from '@common-ts/base/types';

export interface KeyValueRepository<T extends StringMap> {
  get<K extends keyof T>(key: K, defaultValue: T[K]): Promise<T>;
  set<K extends keyof T>(key: K, value: T[K]): Promise<void>;
}
