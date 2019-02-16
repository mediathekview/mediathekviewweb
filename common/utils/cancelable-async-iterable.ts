import { cancelablePromise } from '../promise/cancelable-promise';
import { AnyIterable } from './any-iterable-iterator';
import { iterableToAsyncIterator } from './async-iterable-helpers/to-iterator';

export async function* CancelableAsyncIterableIterator<T>(source: AnyIterable<T>, cancelationPromise: PromiseLike<void>): AsyncIterableIterator<T> {
  const iterator = iterableToAsyncIterator(source);

  while (true) {
    const next = await cancelablePromise(iterator.next(), cancelationPromise);

    if (next.canceled || next.value.done) {
      break;
    }

    yield next.value.value;
  }
}
