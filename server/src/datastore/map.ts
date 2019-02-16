export type Entry<T> = { key: string, value: T };

export interface Map<T> {
  set(key: string, value: T): Promise<void>;
  setMany(entries: Entry<T>[]): Promise<void>;

  has(key: string): Promise<boolean>;
  hasMany(keys: string[]): AsyncIterable<boolean>;

  get(key: string): Promise<T | undefined>;
  getMany(keys: string[]): AsyncIterable<T | undefined>;
  getAll(): AsyncIterable<Entry<T>>;

  delete(key: string): Promise<boolean>;
  deleteMany(iterable: string[]): Promise<number>;

  count(): Promise<number>;
  clear(): Promise<void>;
}
