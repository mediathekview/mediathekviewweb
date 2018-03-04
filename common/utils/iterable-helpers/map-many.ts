import { IteratorFunction } from './types';

export function* mapMany<TIn, TOut>(iterable: Iterable<TIn>, mapper: IteratorFunction<TIn, Iterable<TOut>>): IterableIterator<TOut> {
  let index = 0;

  for (const item of iterable) {
    const mapped = mapper(item, index++);
    yield* mapped;
  }
}
