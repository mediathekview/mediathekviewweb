import { AnyIterable } from '../any-iterable';
import { AsyncIteratorFunction } from './types';
import { isAsyncIterable } from './is-async-iterable';

export async function groupAsync<TIn, TGroup>(iterable: AnyIterable<TIn>, selector: AsyncIteratorFunction<TIn, TGroup>): Promise<Map<TGroup, TIn[]>> {
  if (isAsyncIterable(iterable)) {
    return async(iterable, selector);
  } else {
    return sync(iterable, selector);
  }
}

async function async<TIn, TGroup>(iterable: AsyncIterable<TIn>, selector: AsyncIteratorFunction<TIn, TGroup>): Promise<Map<TGroup, TIn[]>> {
  const map = new Map<TGroup, TIn[]>();

  let index = 0;
  for await (const item of iterable) {
    const value = await selector(item, index++);

    const has = map.has(value);
    if (!has) {
      map.set(value, []);
    }

    const array = map.get(value) as TIn[];
    array.push(item);
  }

  return map;
}

async function sync<TIn, TGroup>(iterable: Iterable<TIn>, selector: AsyncIteratorFunction<TIn, TGroup>): Promise<Map<TGroup, TIn[]>> {
  const map = new Map<TGroup, TIn[]>();

  let index = 0;
  for (const item of iterable) {
    const value = await selector(item, index++);

    const has = map.has(value);
    if (!has) {
      map.set(value, []);
    }

    const array = map.get(value) as TIn[];
    array.push(item);
  }

  return map;
}
