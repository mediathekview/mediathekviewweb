import { any, batch, Comparator, filter, first, forEach, group, intercept, IteratorFunction, map, mapMany, Predicate, range, reduce, Reducer, single, sort } from '../utils';

export class SyncEnumerable<T> implements IterableIterator<T> {
  private readonly source: Iterable<T>;
  private iterator: Iterator<T> | null;

  constructor(iterable: Iterable<T>) {
    this.source = iterable;
    this.iterator = null;
  }

  static from<T>(iterable: Iterable<T>): SyncEnumerable<T> {
    return new SyncEnumerable(iterable);
  }

  static fromRange(fromInclusive: number, toInclusive: number): SyncEnumerable<number> {
    const rangeIterable = range(fromInclusive, toInclusive);
    return new SyncEnumerable(rangeIterable);
  }

  cast<TNew extends T>(): SyncEnumerable<TNew> {
    return this as any as SyncEnumerable<TNew>;
  }

  forceCast<TNew>(): SyncEnumerable<TNew> {
    return this as any as SyncEnumerable<TNew>;
  }

  filter(predicate: Predicate<T>): SyncEnumerable<T> {
    const filtered = filter(this.source, predicate);
    return new SyncEnumerable(filtered);
  }

  map<TOut>(mapper: IteratorFunction<T, TOut>): SyncEnumerable<TOut> {
    const mapped = map(this.source, mapper);
    return new SyncEnumerable(mapped);
  }

  reduce(reducer: Reducer<T, T>): T;
  reduce<U>(reducer: Reducer<T, U>, initialValue: U): U;
  reduce<U>(reducer: Reducer<T, U>, initialValue?: U): U {
    const result = reduce(this.source, reducer, initialValue);
    return result;
  }

  first(): T;
  first(predicate: Predicate<T>): T;
  first(predicate?: Predicate<T>): T;
  first(predicate?: Predicate<T>): T {
    const result = first(this.source, predicate);
    return result;
  }

  single(): T;
  single(predicate: Predicate<T>): T;
  single(predicate?: Predicate<T>): T;
  single(predicate?: Predicate<T>): T {
    const result = single(this.source, predicate);
    return result;
  }

  batch(size: number): SyncEnumerable<T[]> {
    const batched = batch(this.source, size);
    return new SyncEnumerable(batched);
  }

  any(): boolean;
  any(predicate: Predicate<T>): boolean;
  any(predicate?: Predicate<T>): boolean;
  any(predicate?: Predicate<T>): boolean {
    const result = any(this.source, predicate);
    return result;
  }

  mapMany<TOut>(mapper: IteratorFunction<T, Iterable<TOut>>): SyncEnumerable<TOut> {
    const result = mapMany(this.source, mapper);
    return new SyncEnumerable(result);
  }

  sort(): SyncEnumerable<T>;
  sort(comparator: Comparator<T>): SyncEnumerable<T>;
  sort(comparator?: Comparator<T>): SyncEnumerable<T>;
  sort(comparator?: Comparator<T>): SyncEnumerable<T> {
    const sorted = sort(this.source, comparator);
    return new SyncEnumerable(sorted);
  }

  intercept(func: IteratorFunction<T, void>): SyncEnumerable<T> {
    const iterator = intercept(this.source, func);
    return new SyncEnumerable(iterator);
  }

  group<TGroup>(selector: IteratorFunction<T, TGroup>): SyncEnumerable<[TGroup, T[]]> {
    const grouped = group<T, TGroup>(this.source, selector);
    return new SyncEnumerable(grouped);
  }

  toArray(): T[] {
    const array = [...this.source];
    return array;
  }

  forEach(func: IteratorFunction<T, void>) {
    forEach(this.source, func);
  }

  toIterator(): Iterator<T> {
    const iterator = this.source[Symbol.iterator]();
    return iterator;
  }

  next(value?: any): IteratorResult<T> {
    if (this.iterator == null) {
      this.iterator = this.toIterator();
    }

    return this.iterator.next(value);
  }

  [Symbol.iterator](): IterableIterator<T> {
    return (this.source as any)[Symbol.iterator]();
  }
}
