import { AnyIterable } from '../any-iterable';
import { AsyncIteratorFunction } from './types';

export async function groupAsync<TIn, TGroup>(iterable: AnyIterable<TIn>, selector: AsyncIteratorFunction<TIn, TGroup>): Promise<Map<TGroup, TIn[]>> {
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
