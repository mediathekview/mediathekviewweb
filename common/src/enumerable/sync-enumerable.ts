import { Predicate, IteratorFunction, filter, map, single, batch, any, intercept, forEach, mapMany } from "../utils";
import { AsyncEnumerable } from "./async-enumerable";

export class SyncEnumerable<T> implements IterableIterator<T> {
  private readonly source: Iterable<T>;
  private iterator: Iterator<T> | null;

  constructor(iterable: Iterable<T>) {
    this.source = iterable;
  }

  filter(predicate: Predicate<T>): SyncEnumerable<T> {
    const filtered = filter(this.source, predicate);
    return new SyncEnumerable(filtered);
  }

  map<TOut>(mapper: IteratorFunction<T, TOut>): SyncEnumerable<TOut> {
    const mapped = map(this.source, mapper);
    return new SyncEnumerable(mapped);
  }

  single(predicate: Predicate<T>): T {
    const result = single(this.source, predicate);
    return result;
  }

  batch(size: number): SyncEnumerable<T[]> {
    const batched = batch(this.source, size);
    return new SyncEnumerable(batched);
  }

  any(predicate: Predicate<T>): boolean {
    const result = any(this.source, predicate);
    return result;
  }

  mapMany<TOut>(mapper: IteratorFunction<T, Iterable<TOut>>): SyncEnumerable<TOut> {
    const result = mapMany(this.source, mapper);
    return new SyncEnumerable(result);
  }

  intercept(func: IteratorFunction<T, void>): SyncEnumerable<T> {
    const iterator = intercept(this.source, func);
    return new SyncEnumerable(iterator);
  }

  toArray(): T[] {
    const array = Array.from(this.source);
    return array;
  }

  forEach(func: IteratorFunction<T, void>) {
    forEach(this.source, func);
  }

  toAsync(): AsyncEnumerable<T> {
    return new AsyncEnumerable(this.source);
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