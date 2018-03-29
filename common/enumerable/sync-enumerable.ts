import {
  any, batch, filter, forEach, group, intercept,
  IteratorFunction, map, mapMany, Predicate, single
} from '../utils';

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

  filter(predicate: Predicate<T>): SyncEnumerable<T> {
    const filtered = filter(this.source, predicate);
    return new SyncEnumerable(filtered);
  }

  static filter<T>(source: Iterable<T>, predicate: Predicate<T>): SyncEnumerable<T> {
    return new SyncEnumerable(source).filter(predicate);
  }

  map<TOut>(mapper: IteratorFunction<T, TOut>): SyncEnumerable<TOut> {
    const mapped = map(this.source, mapper);
    return new SyncEnumerable(mapped);
  }

  static map<T, TOut>(source: Iterable<T>, mapper: IteratorFunction<T, TOut>): SyncEnumerable<TOut> {
    return new SyncEnumerable(source).map(mapper);
  }

  single(predicate: Predicate<T>): T {
    const result = single(this.source, predicate);
    return result;
  }

  static single<T>(source: Iterable<T>, predicate: Predicate<T>): T {
    return new SyncEnumerable(source).single(predicate);
  }

  batch(size: number): SyncEnumerable<T[]> {
    const batched = batch(this.source, size);
    return new SyncEnumerable(batched);
  }

  static batch<T>(source: Iterable<T>, size: number): SyncEnumerable<T[]> {
    return new SyncEnumerable(source).batch(size);
  }

  any(predicate: Predicate<T>): boolean {
    const result = any(this.source, predicate);
    return result;
  }

  static any<T>(source: Iterable<T>, predicate: Predicate<T>): boolean {
    return new SyncEnumerable(source).any(predicate);
  }

  mapMany<TOut>(mapper: IteratorFunction<T, Iterable<TOut>>): SyncEnumerable<TOut> {
    const result = mapMany(this.source, mapper);
    return new SyncEnumerable(result);
  }

  static mapMany<T, TOut>(source: Iterable<T>, mapper: IteratorFunction<T, Iterable<TOut>>): SyncEnumerable<TOut> {
    return new SyncEnumerable(source).mapMany(mapper);
  }

  intercept(func: IteratorFunction<T, void>): SyncEnumerable<T> {
    const iterator = intercept(this.source, func);
    return new SyncEnumerable(iterator);
  }

  static intercept<T>(source: Iterable<T>, func: IteratorFunction<T, void>): SyncEnumerable<T> {
    return new SyncEnumerable(source).intercept(func);
  }

  group<TGroup>(selector: IteratorFunction<T, TGroup>): SyncEnumerable<[TGroup, T[]]> {
    const grouped = group<T, TGroup>(this.source, selector);
    return new SyncEnumerable(grouped);
  }

  static group<T, TGroup>(source: Iterable<T>, selector: IteratorFunction<T, TGroup>): SyncEnumerable<[TGroup, T[]]> {
    return new SyncEnumerable(source).group(selector);
  }

  toArray(): T[] {
    const array = Array.from(this.source);
    return array;
  }

  static toArray<T>(source: Iterable<T>): T[] {
    return new SyncEnumerable(source).toArray();
  }

  forEach(func: IteratorFunction<T, void>) {
    forEach(this.source, func);
  }

  static forEach<T>(source: Iterable<T>, func: IteratorFunction<T, void>) {
    return new SyncEnumerable(source).forEach(func);
  }

  toIterator(): Iterator<T> {
    const iterator = this.source[Symbol.iterator]();
    return iterator;
  }

  static toIterator<T>(source: Iterable<T>): Iterator<T> {
    return new SyncEnumerable(source).toIterator();
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
