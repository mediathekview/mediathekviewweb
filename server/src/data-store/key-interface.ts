import { Nullable } from '../utils';

export interface IKey<T> {
  key: string;

  get(): Promise<Nullable<T>>;
  set(value: T): Promise<void>;
  increment(increment?: number, threatAsFloat?: boolean): Promise<number>;

  exists(): Promise<boolean>;
  delete(): Promise<boolean>;
}
