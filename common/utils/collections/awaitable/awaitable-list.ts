import { DeferredPromise } from '../../../promise/deferred-promise';

export class AwaitableList<T> implements Iterable<T> {
  private readonly _added: DeferredPromise<T | T[]>;
  private readonly _removed: DeferredPromise<T | T[]>;
  private readonly _cleared: DeferredPromise;

  private backingArray: T[];

  get added(): Promise<T | T[]> {
    return this._added;
  }

  get removed(): Promise<T | T[]> {
    return this._removed;
  }

  get cleared(): Promise<void> {
    return this._cleared;
  }

  get size(): number {
    return this.backingArray.length;
  }

  constructor() {
    this.backingArray = [];

    this._added = new DeferredPromise();
    this._removed = new DeferredPromise();
    this._cleared = new DeferredPromise();
  }

  get(index: number): T {
    if (index >= this.size || index < 0) {
      throw new Error('index out of range');
    }

    return this.backingArray[index];
  }

  append(...items: T[]): number {
    const result = this.backingArray.push(...items);
    this._added.resolve(items);
    this._added.reset();

    return result;
  }

  prepend(...items: T[]): number {
    const result = this.backingArray.unshift(...items);
    this._added.resolve(items);
    this._added.reset();

    return result;
  }

  insert(index: number, ...items: T[]): void {
    if (index >= this.size || index < 0) {
      throw new Error('index out of range');
    }

    this.backingArray.splice(index, 0, ...items);
    this._added.resolve(items);
    this._added.reset();
  }

  remove(index: number, count: number = 1): T[] {
    if (index >= this.size || index < 0) {
      throw new Error('index out of range');
    }

    if ((index + count) > this.size) {
      throw new Error('count out of range');
    }

    const removedItems = this.backingArray.splice(index, count);
    this._removed.resolve(removedItems);
    this._removed.reset();

    return removedItems;
  }

  pop(): T {
    if (this.size == 0) {
      throw new Error('list contains no items');
    }

    const result = this.backingArray.pop() as T;
    this._removed.resolve(result);
    this._removed.reset();

    return result;
  }

  shift(): T {
    if (this.size == 0) {
      throw new Error('list contains no items');
    }

    const result = this.backingArray.shift() as T;
    this._removed.resolve(result);
    this._removed.reset();

    return result;
  }

  clear(): void {
    this.backingArray = [];
    this._cleared.resolve();
    this._cleared.reset();
    this._removed.resolve();
    this._removed.reset();
  }

  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.backingArray[Symbol.iterator]();
  }
}
