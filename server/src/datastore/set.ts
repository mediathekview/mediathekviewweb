export interface Set<T> {
  add(value: T): Promise<void>;
  addMany(iterable: T[]): Promise<void>;

  has(value: T): Promise<boolean>;
  hasMany(iterable: T[]): AsyncIterable<boolean>;

  delete(value: T): Promise<void>;
  deleteMany(iterable: T[]): Promise<void>;

  pop(): Promise<T | undefined>;
  popMany(count: number): Promise<T[]>;
  popAll(): AsyncIterable<T>;

  values(): AsyncIterable<T>;
  count(): Promise<number>;
  clear(): Promise<void>;
}
