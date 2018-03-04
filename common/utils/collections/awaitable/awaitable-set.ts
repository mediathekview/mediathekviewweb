import { ResetPromise } from '../../reset-promise';

export class AwaitableSet<T> implements Set<T> {
  private readonly backingSet: Set<T>;

  added: ResetPromise<T>;
  cleared: ResetPromise<void>;
  deleted: ResetPromise<T>;

  constructor() {
    this.backingSet = new Set();

    this.added = new ResetPromise();
    this.cleared = new ResetPromise();
    this.deleted = new ResetPromise();
  }

  get size(): number {
    return this.backingSet.size;
  }

  add(value: T): this {
    this.backingSet.add(value);
    this.added.resolve(value).reset();

    return this;
  }

  clear(): void {
    this.backingSet.clear();
    this.cleared.resolve().reset();
  }

  delete(value: T): boolean {
    const success = this.backingSet.delete(value);

    if (success) {
      this.deleted.resolve(value).reset();
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

  [Symbol.iterator](): IterableIterator<T> {
    return this.backingSet.values();
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

  [Symbol.toStringTag]: 'Set' = 'Set';
}
