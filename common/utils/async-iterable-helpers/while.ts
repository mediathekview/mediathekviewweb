import { AnyIterable } from '../any-iterable-iterator';
import { isAsyncIterable } from './is-async-iterable';
import { AsyncPredicate } from './types';

export function whileAsync<T>(iterable: AnyIterable<T>, predicate: AsyncPredicate<T>): AsyncIterableIterator<T> {
  if (isAsyncIterable(iterable)) {
    return async(iterable, predicate);
  } else {
    return sync(iterable, predicate);
  }
}

async function* sync<T>(iterable: Iterable<T>, predicate: AsyncPredicate<T>): AsyncIterableIterator<T> {
  let index = 0;

  for (const item of iterable) {
    yield item;

    let goOn = predicate(item, index++);

    if (goOn instanceof Promise) {
      goOn = await goOn;
    }

    if (!goOn) {
      return;
    }
  }
}

async function* async<T>(iterable: AsyncIterable<T>, predicate: AsyncPredicate<T>): AsyncIterableIterator<T> {
  let index = 0;

  for await (const item of iterable) {
    yield item;

    let goOn = predicate(item, index++);

    if (goOn instanceof Promise) {
      goOn = await goOn;
    }

    if (!goOn) {
      return;
    }
  }
}
