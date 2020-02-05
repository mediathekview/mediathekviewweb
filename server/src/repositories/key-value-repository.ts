import { StringMap } from '@tstdl/base/types';

export interface KeyValueRepository<T extends StringMap> {
  get<K extends keyof T, V extends T[K] = T[K]>(scope: string, key: K): Promise<V | undefined>;
  get<K extends keyof T, V extends T[K]>(scope: string, key: K, defaultValue: V): Promise<T[K] | V>;
  set<K extends keyof T>(scope: string, key: K, value: T[K]): Promise<void>;
}
