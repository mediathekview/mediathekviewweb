import { DeferredPromise } from '../../../promise/deferred-promise';

export class AwaitableSet<T> implements Set<T> {
  private readonly backingSet: Set<T>;
  private readonly _added: DeferredPromise<T>;
  private readonly _deleted: DeferredPromise<T>;
  private readonly _cleared: DeferredPromise;

  [Symbol.toStringTag]: 'Set' = 'Set';

  get added(): Promise<T | T[]> {
    return this._added;
  }

  get cleared(): Promise<void> {
    return this._cleared;
  }

  get deleted(): Promise<T> {
    return this._deleted;
  }

  get size(): number {
    return this.backingSet.size;
  }

  constructor() {
    this.backingSet = new Set();

    this._added = new DeferredPromise();
    this._cleared = new DeferredPromise();
    this._deleted = new DeferredPromise();
  }

  add(value: T): this {
    this.backingSet.add(value);
    this._added.resolve(value);
    this._added.reset();

    return this;
  }

  clear(): void {
    this.backingSet.clear();
    this._cleared.resolve()
    this._cleared.reset();
  }

  delete(value: T): boolean {
    const success = this.backingSet.delete(value);

    if (success) {
      this._deleted.resolve(value);
      this._deleted.reset();
    }

    return success;
  }

  forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
    this.backingSet.forEach(callbackfn, thisArg);
  }

  has(value: T): boolean {
    return this.backingSet.has(value);
  }

  entries(): IterableIterator<[T, T]> {
    return this.backingSet.entries();
  }

  keys(): IterableIterator<T> {
    return this.backingSet.keys();
  }

  values(): IterableIterator<T> {
    return this.backingSet.values();
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.backingSet[Symbol.iterator]();
  }
}
