export interface ISet<T> {
  key: string;

  add(members: T[] | T): Promise<number>;
  has(member: T): Promise<boolean>;
  remove(members: T[] | T): Promise<number>;
  pop(count: number): Promise<T[]>;
  size(): Promise<number>;
  flush(): Promise<boolean>;

  intersect(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number>;
  union(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number>;
  diff(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number>;
  move(destination: ISet<T>): Promise<void>;
}
