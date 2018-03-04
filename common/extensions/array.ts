import { SyncEnumerable } from '../enumerable';

declare global {
  interface Array<T> {
    toEnumerable(): SyncEnumerable<T>;
  }
}

function toEnumerable<T>(this: T[]): SyncEnumerable<T> {
  return new SyncEnumerable(this);
}

if (Array.prototype.toEnumerable == undefined) {
  Array.prototype.toEnumerable = toEnumerable;
}