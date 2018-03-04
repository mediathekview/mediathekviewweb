import { AnyIterable, isAsyncIterable } from '../';
import { AsyncPredicate } from './types';

export async function anyAsync<T>(iterable: AnyIterable<T>, predicate: AsyncPredicate<T>): Promise<boolean> {
  const isAsync = isAsyncIterable(iterable);

  if (isAsync) {
    return async(iterable as AsyncIterable<T>, predicate);
  } else {
    return sync(iterable as Iterable<T>, predicate);
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
