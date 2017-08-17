export interface ISet<T> {
  key: string;

  add(members: T[] | T): Promise<number>;
  has(member: T): Promise<boolean>;
  remove(members: T[] | T): Promise<number>;
  members(): Promise<T[]>;
  pop(count: number): Promise<T[]>;
  size(): Promise<number>;
  delete(): Promise<boolean>;

  intersect(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number>;
  union(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number>;
  diff(destination: ISet<T>, ...sets: ISet<T>[]): Promise<number>;
  clone(destination: ISet<T>): Promise<void>;
}
