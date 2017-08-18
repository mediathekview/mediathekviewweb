import { Nullable } from '../utils';

export interface IKey<T> {
  key: string;

  get(): Promise<Nullable<T>>;
  set(value: T): Promise<void>;

  exists(): Promise<boolean>;
  delete(): Promise<boolean>;
}
