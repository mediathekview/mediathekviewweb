export interface ISet<T> {
  add(...items: T[]): Promise<number>;
  has(item: T): Promise<boolean>;
  remove(...items: T[]): Promise<number>;
  pop(count: number): Promise<T[]>;
}
