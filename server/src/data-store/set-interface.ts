export interface ISet<T> {
  add(item: T): Promise<boolean>;
  has(item: T): Promise<boolean>;
  remove(item: T): Promise<boolean>;
}
