import { Undefinable, AnyIterable } from '../common/utils';

export type Entry<T> = { key: string, value: T };

export interface Map<T> {
    set(key: string, value: T): Promise<void>;
    set(iterable: AnyIterable<Entry<T>>): Promise<void>;

    has(key: string): Promise<boolean>;
    has(iterable: AnyIterable<string>): AsyncIterable<boolean>;

    get(): AsyncIterable<Entry<T>>;
    get(key: string): Promise<Undefinable<T>>;
    get(iterable: AnyIterable<string>): AsyncIterable<Undefinable<T>>;

    delete(key: string): Promise<number>;
    delete(iterable: AnyIterable<string>): Promise<number>;

    count(): Promise<number>;
    clear(): Promise<void>;
}
