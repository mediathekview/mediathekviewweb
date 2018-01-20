import { Undefinable } from '../common/utils';

export interface Key<T> {
    set(value: T): Promise<void>;
    get(): Promise<Undefinable<T>>;
    exists(): Promise<boolean>;
    delete(): Promise<boolean>;
}