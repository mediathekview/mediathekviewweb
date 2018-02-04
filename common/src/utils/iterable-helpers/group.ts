import { IteratorFunction } from './types';

export function group<TIn, TGroup>(iterable: Iterable<TIn>, selector: IteratorFunction<TIn, TGroup>): Map<TGroup, TIn[]> {
  const map = new Map<TGroup, TIn[]>();

  let index = 0;
  for (const item of iterable) {
    const value = selector(item, index++);

    const has = map.has(value);
    if (!has) {
      map.set(value, []);
    }

    const array = map.get(value) as TIn[];
    array.push(item);
  }

  return map;
}
