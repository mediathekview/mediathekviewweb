export interface ISet<T> {
  add(...items: T[]): Promise<boolean>;
  has(item: T): Promise<boolean>;
  remove(...items: T[]): Promise<boolean>;
  pop(count: number): Promise<T[]>;
}
