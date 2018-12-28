import '../../../extensions/set';
import { DeferredPromise } from '../../../promise/deferred-promise';

export class AwaitableSet<T> implements Set<T> {
  private readonly backingSet: Set<T>;
  private readonly _added: DeferredPromise<T>;
  private readonly _deleted: DeferredPromise<T>;
  private readonly _cleared: DeferredPromise;

  get added(): Promise<T | T[]> {
    return this._added;
  }

  get cleared(): Promise<void> {
    return this._cleared;
  }

  get deleted(): Promise<T> {
    return this._deleted;
  }

  constructor() {
    this.backingSet = new Set();

    this._added = new DeferredPromise();
    this._cleared = new DeferredPromise();
    this._deleted = new DeferredPromise();
  }

  get size(): number {
    return this.backingSet.size;
  }

  add(value: T): this {
    this.backingSet.add(value);
    this._added.resolve(value).reset();

    return this;
  }

  clear(): void {
    this.backingSet.clear();
    this._cleared.resolve().reset();
  }

  delete(value: T): boolean {
    const success = this.backingSet.delete(value);

    if (success) {
      this._deleted.resolve(value).reset();
    }

    return success;
  }

  forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
    return this.backingSet.forEach(callbackfn, thisArg);
  }

  has(value: T): boolean {
    return this.backingSet.has(value);
  }

  intersect(...sets: Set<T>[]): Set<T> {
    return this.backingSet.intersect(...sets);
  }

  difference(...sets: Set<T>[]): Set<T> {
    return this.backingSet.difference(...sets);
  }

  union(...sets: Set<T>[]): Set<T> {
    return this.backingSet.union(...sets);
  }

  entries(): IterableIterator<[T, T]> {
    return this.backingSet.entries()
  }

  keys(): IterableIterator<T> {
    return this.backingSet.keys()
  }

  values(): IterableIterator<T> {
    return this.backingSet.values()
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.backingSet[Symbol.iterator]();
  }

  [Symbol.toStringTag]: 'Set' = 'Set';
}
