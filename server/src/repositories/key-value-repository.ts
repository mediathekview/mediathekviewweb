import { StringMap } from '@tstdl/base/types';

export interface KeyValueRepository<T extends StringMap> {
  get<K extends keyof T, V extends T[K] = T[K]>(key: K): Promise<V | undefined>;
  get<K extends keyof T, V extends T[K]>(key: K, defaultValue: V): Promise<T[K] | V>;
  set<K extends keyof T>(key: K, value: T[K]): Promise<void>;
}
