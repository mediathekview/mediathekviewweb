import { ResetPromise } from '../../reset-promise';

export class AwaitableList<T> implements Iterable<T> {
  private backingArray: T[];

  added: ResetPromise<T>;
  removed: ResetPromise<T>;
  cleared: ResetPromise<T>;

  constructor() {
    this.backingArray = [];

    this.added = new ResetPromise();
    this.removed = new ResetPromise();
    this.cleared = new ResetPromise();
  }

  get size(): number {
    return this.backingArray.length;
  }

  push(...items: T[]): number {
    const result = this.backingArray.push(...items);
    items.forEach((value) => this.added.resolve(value).reset());

    return result;
  }

  pop(): T | undefined {
    const result = this.backingArray.pop();
    this.removed.resolve(result).reset();

    return result;
  }

  shift(): T | undefined {
    const result = this.backingArray.shift();
    this.removed.resolve(result).reset();

    return result;
  }

  clear() {
    this.backingArray = [];
    this.cleared.resolve().reset();
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.backingArray[Symbol.iterator]();
  }
}