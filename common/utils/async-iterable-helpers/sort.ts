import { AnyIterable } from '../any-iterable';
import { toArrayAsync } from './to-array';
import { AsyncComparator } from './types';

export function sortAsync<T>(iterable: AnyIterable<T>): AsyncIterable<T>
export function sortAsync<T>(iterable: AnyIterable<T>, comparator: AsyncComparator<T>): AsyncIterable<T>
export function sortAsync<T>(iterable: AnyIterable<T>, comparator?: AsyncComparator<T>): AsyncIterable<T> {
    let sortedAsyncIterable: AsyncIterable<T>;

    if (comparator == undefined) {
        sortedAsyncIterable = sortWithoutComparator(iterable);
    } else {
        sortedAsyncIterable = sortWithComparator(iterable, comparator);
    }

    return sortedAsyncIterable;
}

async function* sortWithoutComparator<T>(iterable: AnyIterable<T>): AsyncIterable<T> {
    const array = await toArrayAsync(iterable);
    const sorted = array.sort();

    yield* sorted;
}

async function* sortWithComparator<T>(_iterable: AnyIterable<T>, _comparator: AsyncComparator<T>): AsyncIterable<T> {
    throw new Error('not implemented');
}