import { AnyIterable, AsyncIteratorFunction } from '../';

export async function* mapManyAsync<TIn, TOut>(iterable: AnyIterable<TIn>, mapper: AsyncIteratorFunction<TIn, AnyIterable<TOut>>): AsyncIterableIterator<TOut> {
  let index = 0;

  for await (const item of iterable) {
    let mapped = mapper(item, index++);

    if (mapped instanceof Promise) {
      mapped = await mapped;
    }

    yield* mapped;
  }
}
