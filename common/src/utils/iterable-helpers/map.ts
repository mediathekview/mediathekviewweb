import { IteratorFunction } from './types';

export function* map<TIn, TOut>(iterable: Iterable<TIn>, mapper: IteratorFunction<TIn, TOut>): IterableIterator<TOut> {
  let index = 0;

  for (const item of iterable) {
    const mapped = mapper(item, index++);
    yield mapped;
  }
}