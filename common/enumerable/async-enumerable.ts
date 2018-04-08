import {
  anyAsync, AsyncIteratorFunction, AsyncPredicate, batchAsync,
  BufferedAsyncIterable, filterAsync, forEachAsync, interceptAsync,
  interruptEveryAsync, interruptPerSecondAsync, isAsyncIterable, isIterable,
  mapAsync, mapManyAsync, ParallelizableIteratorFunction, ParallelizablePredicate,
  singleAsync, toArrayAsync, toAsyncIterable, toAsyncIterator, toSync
} from '../utils';
import { AnyIterable } from '../utils/any-iterable';
import { groupAsync } from '../utils/async-iterable-helpers/group';
import { parallelFilter, parallelForEach, parallelGroup, parallelIntercept, parallelMap } from '../utils/async-iterable-helpers/parallel';
import { SyncEnumerable } from './sync-enumerable';

export class AsyncEnumerable<T> implements AsyncIterableIterator<T>  {
  private readonly source: AnyIterable<T>;
  private asyncIterator: AsyncIterator<T> | null;

  constructor(iterable: AnyIterable<T>) {
    this.source = iterable;
    this.asyncIterator = null;
  }

  static from<T>(iterable: AnyIterable<T>): AsyncEnumerable<T> {
    return new AsyncEnumerable(iterable);
  }

  cast<TNew extends T>(): AsyncEnumerable<TNew> {
    return this as any as AsyncEnumerable<TNew>;
  }

  forceCast<TNew>(): AsyncEnumerable<TNew> {
    return this as any as AsyncEnumerable<TNew>;
  }

  filter(predicate: AsyncPredicate<T>): AsyncEnumerable<T> {
    const filtered = filterAsync(this.source, predicate);
    return new AsyncEnumerable(filtered);
  }

  map<TOut>(mapper: AsyncIteratorFunction<T, TOut>): AsyncEnumerable<TOut> {
    const result = mapAsync(this.source, mapper);
    return new AsyncEnumerable(result);
  }

  single(): Promise<T>
  single(predicate: AsyncPredicate<T>): Promise<T>
  single(predicate?: AsyncPredicate<T>): Promise<T>
  single(predicate?: AsyncPredicate<T>): Promise<T> {
    const result = singleAsync(this.source, predicate);
    return result;
  }

  batch(size: number): AsyncEnumerable<T[]> {
    const result = batchAsync(this.source, size);
    return new AsyncEnumerable(result);
  }

  buffer(size: number): AsyncEnumerable<T> {
    const result = new BufferedAsyncIterable(this.source, size);
    return new AsyncEnumerable(result);
  }

  any(predicate: AsyncPredicate<T>): Promise<boolean> {
    const result = anyAsync(this.source, predicate);
    return result;
  }

  mapMany<TOut>(mapper: AsyncIteratorFunction<T, AnyIterable<TOut>>): AsyncEnumerable<TOut> {
    const result = mapManyAsync(this.source, mapper);
    return new AsyncEnumerable(result);
  }

  intercept(func: AsyncIteratorFunction<T, void>): AsyncEnumerable<T> {
    const iterator = interceptAsync(this.source, func);
    return new AsyncEnumerable(iterator);
  }

  group<TGroup>(selector: AsyncIteratorFunction<T, TGroup>): Promise<Map<TGroup, T[]>> {
    const grouped = groupAsync<T, TGroup>(this.source, selector);
    return grouped;
  }

  async toSync(): Promise<SyncEnumerable<T>> {
    const syncIterable = await toSync(this.source);
    return new SyncEnumerable(syncIterable);
  }

  toArray(): Promise<T[]> {
    const array = toArrayAsync(this.source);
    return array;
  }

  forEach(func: AsyncIteratorFunction<T, void>): Promise<void> {
    const result = forEachAsync(this.source, func);
    return result;
  }

  parallelForEach(concurrency: number, func: ParallelizableIteratorFunction<T, any>): Promise<void> {
    const result = parallelForEach(this.source, concurrency, func);
    return result;
  }

  parallelFilter(concurrency: number, keepOrder: boolean, predicate: ParallelizablePredicate<T>): AsyncEnumerable<T> {
    const result = parallelFilter(this.source, concurrency, keepOrder, predicate);
    return new AsyncEnumerable(result);
  }

  parallelMap<TOut>(concurrency: number, keepOrder: boolean, func: ParallelizableIteratorFunction<T, TOut>): AsyncEnumerable<TOut> {
    const result = parallelMap(this.source, concurrency, keepOrder, func);
    return new AsyncEnumerable(result);
  }

  parallelIntercept(concurrency: number, keepOrder: boolean, func: ParallelizableIteratorFunction<T, void>): AsyncEnumerable<T> {
    const result = parallelIntercept(this.source, concurrency, keepOrder, func);
    return new AsyncEnumerable(result);
  }

  parallelGroup<TGroup>(concurrency: number, selector: ParallelizableIteratorFunction<T, TGroup>): Promise<Map<TGroup, T[]>> {
    const grouped = parallelGroup(this.source, concurrency, selector);
    return grouped;
  }

  interruptEvery(value: number): AsyncEnumerable<T> {
    const interrupted = interruptEveryAsync(this.source, value);
    return new AsyncEnumerable(interrupted);
  }

  interruptPerSecond(value: number): AsyncEnumerable<T> {
    const interrupted = interruptPerSecondAsync(this.source, value);
    return new AsyncEnumerable(interrupted);
  }

  toAsync(): AsyncEnumerable<T> {
    return this;
  }

  toIterator(): AsyncIterator<T> {
    const iterator = toAsyncIterator(this.source);
    return iterator;
  }

  next(value?: any): Promise<IteratorResult<T>> {
    if (this.asyncIterator == null) {
      this.asyncIterator = this.toIterator();
    }

    return this.asyncIterator.next(value);
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    if (isAsyncIterable(this.source)) {
      return (this.source as AsyncIterableIterator<T>)[Symbol.asyncIterator]();
    }
    else if (isIterable(this.source)) {
      return toAsyncIterable(this.source as Iterable<T>);
    }

    throw new Error('source is neither iterable nor async-iterable');
  }
}
