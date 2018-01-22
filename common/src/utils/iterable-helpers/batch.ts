export function* batch<T>(iterable: Iterable<T>, size: number): IterableIterator<T[]> {
  let buffer: T[] = [];

  for (const item of iterable) {
    buffer.push(item);

    if (buffer.length >= size) {
      yield buffer;
      buffer = [];
    }
  }

  if (buffer.length > 0) {
    yield buffer;
  }
}
