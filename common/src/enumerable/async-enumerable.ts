import { AnyIterable } from '../utils/any-iterable';
import { parallelForEach, parallelMap, parallelFilter, parallelIntercept } from '../utils/async-iterable-helpers/parallel';
import { BufferedAsyncIterable, isAsyncIterable, isIterable, toAsyncIterable } from '../utils';
import { SyncEnumerable } from './sync-enumerable';
import {
  AsyncPredicate, AsyncIteratorFunction, ParallelizableIteratorFunction, ParallelizablePredicate,
  filterAsync, mapAsync, singleAsync, batchAsync, anyAsync, toArrayAsync, interceptAsync, toAsyncIterator, forEachAsync, interruptEveryAsync, mapManyAsync
} from '../utils';
import { groupAsync } from '../utils/async-iterable-helpers/group';
import { parallelGroup } from '../utils/async-iterable-helpers/parallel/group';

export class AsyncEnumerable<T> implements AsyncIterableIterator<T>  {
  private readonly source: AnyIterable<T>;
  private asyncIterator: AsyncIterator<T> | null;

  constructor(iterable: Iterable<T>);
  constructor(iterable: AsyncIterable<T>);
  constructor(iterable: AnyIterable<T>);
  constructor(iterable: AnyIterable<T>) {
    this.source = iterable;
  }

  filter(predicate: AsyncPredicate<T>): AsyncEnumerable<T> {
    const filtered = filterAsync(this.source, predicate);
    return new AsyncEnumerable(filtered);
  }

  static filter<T>(source: AsyncIterable<T>, predicate: AsyncPredicate<T>): AsyncEnumerable<T> {
    return new AsyncEnumerable(source).filter(predicate);
  }

  map<TOut>(mapper: AsyncIteratorFunction<T, TOut>): AsyncEnumerable<TOut> {
    const result = mapAsync(this.source, mapper);
    return new AsyncEnumerable(result);
  }

  static map<T, TOut>(source: AnyIterable<T>, mapper: AsyncIteratorFunction<T, TOut>): AsyncEnumerable<TOut> {
    return new AsyncEnumerable(source).map(mapper);
  }

  single(predicate: AsyncPredicate<T>): Promise<T> {
    const result = singleAsync(this.source, predicate);
    return result;
  }

  static single<T>(source: AnyIterable<T>, predicate: AsyncPredicate<T>): Promise<T> {
    return new AsyncEnumerable(source).single(predicate);
  }

  batch(size: number): AsyncEnumerable<T[]> {
    const result = batchAsync(this.source, size);
    return new AsyncEnumerable(result);
  }

  static batch<T>(source: AnyIterable<T>, size: number): AsyncEnumerable<T[]> {
    return new AsyncEnumerable(source).batch(size);
  }

  buffer(size: number): AsyncEnumerable<T> {
    const result = new BufferedAsyncIterable(this.source, size);
    return new AsyncEnumerable(result);
  }

  static buffer<T>(source: AnyIterable<T>, size: number): AsyncEnumerable<T> {
    return new AsyncEnumerable(source).buffer(size);
  }

  any(predicate: AsyncPredicate<T>): Promise<boolean> {
    const result = anyAsync(this.source, predicate);
    return result;
  }

  static any<T>(source: AnyIterable<T>, predicate: AsyncPredicate<T>): Promise<boolean> {
    return new AsyncEnumerable(source).any(predicate);
  }

  mapMany<TOut>(mapper: AsyncIteratorFunction<T, AnyIterable<TOut>>): AsyncEnumerable<TOut> {
    const result = mapManyAsync(this.source, mapper);
    return new AsyncEnumerable(result);
  }

  static mapMany<T, TOut>(source: AnyIterable<T>, mapper: AsyncIteratorFunction<T, AnyIterable<TOut>>): AsyncEnumerable<TOut> {
    return new AsyncEnumerable(source).mapMany(mapper);
  }

  intercept(func: AsyncIteratorFunction<T, void>): AsyncEnumerable<T> {
    const iterator = interceptAsync(this.source, func);
    return new AsyncEnumerable(iterator);
  }

  static intercept<T>(source: AsyncEnumerable<T>, func: AsyncIteratorFunction<T, void>): AsyncEnumerable<T> {
    return new AsyncEnumerable(source).intercept(func);
  }

  group<TGroup>(selector: AsyncIteratorFunction<T, TGroup>): Promise<Map<TGroup, T[]>> {
    const grouped = groupAsync<T, TGroup>(this.source, selector);
    return grouped;
  }

  static group<T, TGroup>(source: Iterable<T>, selector: AsyncIteratorFunction<T, TGroup>): Promise<Map<TGroup, T[]>> {
    return new AsyncEnumerable(source).group(selector);
  }

  toArray(): Promise<T[]> {
    const array = toArrayAsync(this.source);
    return array;
  }

  static toArray<T>(source: AnyIterable<T>): Promise<T[]> {
    return new AsyncEnumerable(source).toArray();
  }

  forEach(func: AsyncIteratorFunction<T, void>): Promise<void> {
    const result = forEachAsync(this.source, func);
    return result;
  }

  static forEach<T>(source: AnyIterable<T>, func: AsyncIteratorFunction<T, void>): Promise<void> {
    return new AsyncEnumerable(source).forEach(func);
  }

  parallelForEach(concurrency: number, func: ParallelizableIteratorFunction<T, void>): Promise<void> {
    const result = parallelForEach(this.source, concurrency, func);
    return result;
  }

  static parallelForEach<T>(source: AnyIterable<T>, concurrency: number, func: ParallelizableIteratorFunction<T, void>): Promise<void> {
    return new AsyncEnumerable(source).parallelForEach(concurrency, func);
  }

  parallelFilter(concurrency: number, keepOrder: boolean, predicate: ParallelizablePredicate<T>): AsyncEnumerable<T> {
    const result = parallelFilter(this.source, concurrency, keepOrder, predicate);
    return new AsyncEnumerable(result);
  }

  static parallelFilter<T>(source: AnyIterable<T>, concurrency: number, keepOrder: boolean, predicate: ParallelizablePredicate<T>): AsyncEnumerable<T> {
    return new AsyncEnumerable(source).parallelFilter(concurrency, keepOrder, predicate);
  }

  parallelMap<TOut>(concurrency: number, keepOrder: boolean, func: ParallelizableIteratorFunction<T, TOut>): AsyncEnumerable<TOut> {
    const result = parallelMap(this.source, concurrency, keepOrder, func);
    return new AsyncEnumerable(result);
  }

  static parallelMap<T, TOut>(source: AnyIterable<T>, concurrency: number, keepOrder: boolean, func: ParallelizableIteratorFunction<T, TOut>): AsyncEnumerable<TOut> {
    return new AsyncEnumerable(source).parallelMap(concurrency, keepOrder, func);
  }

  parallelIntercept(concurrency: number, keepOrder: boolean, func: ParallelizableIteratorFunction<T, void>): AsyncEnumerable<T> {
    const result = parallelIntercept(this.source, concurrency, keepOrder, func);
    return new AsyncEnumerable(result);
  }

  static parallelIntercept<T>(source: AnyIterable<T>, concurrency: number, keepOrder: boolean, func: ParallelizableIteratorFunction<T, void>): AsyncEnumerable<T> {
    return new AsyncEnumerable(source).parallelIntercept(concurrency, keepOrder, func);
  }

  parallelGroup<TGroup>(concurrency: number, selector: ParallelizableIteratorFunction<T, TGroup>): Promise<Map<TGroup, T[]>> {
    const grouped = parallelGroup(this.source, concurrency, selector);
    return grouped;
  }

  static parallelGroup<T, TGroup>(source: AnyIterable<T>, concurrency: number, selector: ParallelizableIteratorFunction<T, TGroup>): Promise<Map<TGroup, T[]>> {
    return new AsyncEnumerable(source).parallelGroup(concurrency, selector);
  }

  interruptEvery(value: number): AsyncEnumerable<T> {
    const interrupted = interruptEveryAsync(this.source, value);
    return new AsyncEnumerable(interrupted);
  }

  static interruptEvery<T>(source: AnyIterable<T>, value: number): AsyncEnumerable<T> {
    return new AsyncEnumerable(source).interruptEvery(value);
  }

  async toSync(): Promise<SyncEnumerable<T>> {
    const array = await this.toArray();
    return new SyncEnumerable(array);
  }

  static async toSync<T>(source: AnyIterable<T>): Promise<SyncEnumerable<T>> {
    return new AsyncEnumerable(source).toSync();
  }

  toAsync(): AsyncEnumerable<T> {
    return this;
  }

  toIterator(): AsyncIterator<T> {
    const iterator = toAsyncIterator(this.source);
    return iterator;
  }

  static toIterator<T>(source: AnyIterable<T>): AsyncIterator<T> {
    return new AsyncEnumerable(source).toIterator();
  }

  next(value?: any): Promise<IteratorResult<T>> {
    if (this.asyncIterator == null) {
      this.asyncIterator = this.toIterator();
    }

    return this.asyncIterator.next(value);
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    if (isAsyncIterable(this.source)) {
      return (this.source as any)[Symbol.asyncIterator]();
    }
    else if (isIterable(this.source)) {
      return toAsyncIterable(this.source as Iterable<T>);
    }

    throw new Error('source is neither iterable nor async-iterable');
  }
}
