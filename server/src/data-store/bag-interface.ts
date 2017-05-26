export interface IBag<T, T2> {
  add(item: T): Promise<T2>;
  has(item: T): Promise<boolean>;
  remove(item: T): Promise<boolean>;
}
