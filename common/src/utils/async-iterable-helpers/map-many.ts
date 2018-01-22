import { AnyIterable, AsyncIteratorFunction } from '../';

export async function* mapManyAsync<TIn, TOut>(iterable: AnyIterable<TIn>, mapper: AsyncIteratorFunction<TIn, AnyIterable<TOut>>): AsyncIterableIterator<TOut> {
  let index = 0;

  for await (const item of iterable) {
    const mapped = mapper(item, index++);
    yield* mapped;
  }
}
