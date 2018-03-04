import { AnyIterable, ParallelizableIteratorFunction } from '../../';
import { parallelForEach } from './for-each';

export async function parallelGroup<TIn, TGroup>(iterable: AnyIterable<TIn>, concurrency: number, selector: ParallelizableIteratorFunction<TIn, TGroup>): Promise<Map<TGroup, TIn[]>> {
  const map = new Map<TGroup, TIn[]>();

  await parallelForEach(iterable, concurrency, async (item, index) => {
    const value = await selector(item, index);

    const has = map.has(value);
    if (!has) {
      map.set(value, []);
    }

    const array = map.get(value) as TIn[];
    array.push(item);
  });

  return map;
}
