export interface IKey<T> {
  key: string;

  get(): Promise<T>;
  set(value: T): Promise<void>;

  exists(): Promise<boolean>;
  delete(): Promise<boolean>;
}
