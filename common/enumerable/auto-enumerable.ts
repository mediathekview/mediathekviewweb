import { SyncEnumerable } from './sync-enumerable';
import { AsyncEnumerable } from './async-enumerable';
import { AnyIterable, isIterable, isAsyncIterable } from '../utils';

export function getEnumerable<T>(iterable: AnyIterable<T>): SyncEnumerable<T> | AsyncEnumerable<T> {
  if (isIterable(iterable)) {
    return new SyncEnumerable(iterable as Iterable<T>);
  }
  else if (isAsyncIterable(iterable)) {
    return new AsyncEnumerable(iterable);
  }
  else {
    throw new Error('object is neither iterable nor asyncIterable');
  }
}
