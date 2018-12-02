export function* range(fromInclusive: number, toInclusive: number): IterableIterator<number> {
  for (let i = fromInclusive; i < toInclusive; i++) {
    yield i;
  }
}
