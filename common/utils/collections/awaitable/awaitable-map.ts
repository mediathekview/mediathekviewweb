import { ResetPromise } from '../../reset-promise';

export class AwaitableMap<K, V> implements Map<K, V> {
  private readonly backingMap: Map<K, V>;
  private readonly _setted: ResetPromise<[K, V]>;
  private readonly _cleared: ResetPromise<void>;
  private readonly _deleted: ResetPromise<K>;

  get setted(): Promise<[K, V]> {
    return this._setted;
  }

  get cleared(): Promise<void> {
    return this._cleared;
  }

  get deleted(): Promise<K> {
    return this._deleted;
  }

  constructor() {
    this.backingMap = new Map();

    this._setted = new ResetPromise();
    this._cleared = new ResetPromise();
    this._deleted = new ResetPromise();
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
    this._cleared.resolve().reset();
  }

  delete(key: K): boolean {
    const success = this.backingMap.delete(key);

    if (success) {
      this._deleted.resolve(key).reset();
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

    this._setted.resolve([key, value]).reset();

    return this;
  }

  [Symbol.toStringTag]: 'Map' = 'Map';
}
