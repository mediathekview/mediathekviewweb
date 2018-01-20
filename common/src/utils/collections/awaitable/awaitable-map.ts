import { ResetPromise } from '../../reset-promise';

export class AwaitableMap<K, V> implements Map<K, V> {
  private readonly backingMap: Map<K, V>;

  setted: ResetPromise<[K, V]>;
  cleared: ResetPromise<void>;
  deleted: ResetPromise<K>;

  constructor() {
    this.backingMap = new Map();

    this.setted = new ResetPromise();
    this.cleared = new ResetPromise();
    this.deleted = new ResetPromise();
  }

  get size(): number {
    return this.backingMap.size;
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.backingMap.entries();
  }

  entries(): IterableIterator<[K, V]> {
    return this.backingMap.entries();
  }

  keys(): IterableIterator<K> {
    return this.backingMap.keys();
  }

  values(): IterableIterator<V> {
    return this.backingMap.values();
  }

  clear(): void {
    this.backingMap.clear();
    this.cleared.resolve().reset();
  }

  delete(key: K): boolean {
    const success = this.backingMap.delete(key);

    if (success) {
      this.deleted.resolve(key).reset();
    }

    return success;
  }

  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    return this.backingMap.forEach(callbackfn, thisArg);
  }

  get(key: K): V | undefined {
    return this.backingMap.get(key);
  }

  has(key: K): boolean {
    return this.backingMap.has(key);
  }

  set(key: K, value: V): this {
    this.backingMap.set(key, value);

    this.setted.resolve([key, value]).reset();

    return this;
  }

  [Symbol.toStringTag]: 'Map' = 'Map';
}