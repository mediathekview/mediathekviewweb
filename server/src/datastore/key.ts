export interface Key<T> {
  set(value: T): Promise<void>;
  get(): Promise<T | undefined>;
  exists(): Promise<boolean>;
  delete(): Promise<boolean>;
}
