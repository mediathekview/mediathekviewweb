export interface ISet<T> {
  key: string;

  add(items: T[] | T): Promise<number>;
  has(item: T): Promise<boolean>;
  remove(items: T[] | T): Promise<number>;
  pop(count: number): Promise<T[]>;
  size(): Promise<number>;
  flush(): Promise<boolean>;

  intersect(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number>;
  union(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number>;
  diff(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number>;
  move(destination: ISet<T>): Promise<void>;
}
