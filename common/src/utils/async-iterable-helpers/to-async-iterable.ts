export async function* toAsyncIterable<T>(iterable: Iterable<T>): AsyncIterableIterator<T> {
  yield* iterable;
}
