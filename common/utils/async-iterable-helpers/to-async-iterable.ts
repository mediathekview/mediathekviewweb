export async function* toAsyncIterableIterator<T>(iterable: Iterable<T>): AsyncIterableIterator<T> {
  yield* iterable;
}
