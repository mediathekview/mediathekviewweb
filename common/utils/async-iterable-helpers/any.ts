import { AnyIterable } from '../any-iterable-iterator';
import { isAsyncIterable } from './is-async-iterable';
import { AsyncPredicate } from './types';

export async function anyAsync<T>(iterable: AnyIterable<T>, predicate: AsyncPredicate<T>): Promise<boolean> {
  if (isAsyncIterable(iterable)) {
    return async(iterable, predicate);
  } else {
    return sync(iterable, predicate);
  }
}

async function sync<T>(iterable: Iterable<T>, predicate: AsyncPredicate<T>): Promise<boolean> {
  let index = 0;

  for (const item of iterable) {
    let matches = predicate(item, index++);

    if (matches instanceof Promise) {
      matches = await matches;
    }

    if (matches) {
      return true;
    }
  }

  return false;
}

async function async<T>(iterable: AsyncIterable<T>, predicate: AsyncPredicate<T>): Promise<boolean> {
  let index = 0;

  for await (const item of iterable) {
    let matches = predicate(item, index++);

    if (matches instanceof Promise) {
      matches = await matches;
    }

    if (matches) {
      return true;
    }
  }

  return false;
}
