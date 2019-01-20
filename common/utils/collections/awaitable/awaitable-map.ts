import { DeferredPromise } from '../../../promise/deferred-promise';
import { differenceMaps, intersectMaps, unionMaps } from '../../map';

export class AwaitableMap<K, V> implements Map<K, V> {
  private readonly backingMap: Map<K, V>;
  private readonly _setted: DeferredPromise<[K, V]>;
  private readonly _cleared: DeferredPromise;
  private readonly _deleted: DeferredPromise<K>;

  [Symbol.toStringTag]: 'Map' = 'Map';

  get setted(): Promise<[K, V]> {
    return this._setted;
  }

  get cleared(): Promise<void> {
    return this._cleared;
  }

  get deleted(): Promise<K> {
    return this._deleted;
  }

  get size(): number {
    return this.backingMap.size;
  }

  static from<K, V>(map: Map<K, V>, clone: boolean = true): AwaitableMap<K, V> {
    if (!clone) {
      return new AwaitableMap(map);
    }

    const awaitableMap = new AwaitableMap<K, V>();

    for (const [key, value] of map) {
      awaitableMap.set(key, value);
    }

    return awaitableMap;
  }

  constructor(backingMap: Map<K, V> = new Map<K, V>()) {
    this.backingMap = backingMap;

    this._setted = new DeferredPromise();
    this._cleared = new DeferredPromise();
    this._deleted = new DeferredPromise();
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
    this._cleared.resolve();
    this._cleared.reset();
  }

  delete(key: K): boolean {
    const success = this.backingMap.delete(key);

    if (success) {
      this._deleted.resolve(key);
      this._deleted.reset();
    }

    return success;
  }

  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    this.backingMap.forEach(callbackfn, thisArg);
  }

  get(key: K): V | undefined {
    return this.backingMap.get(key);
  }

  has(key: K): boolean {
    return this.backingMap.has(key);
  }

  set(key: K, value: V): this {
    this.backingMap.set(key, value);

    this._setted.resolve([key, value]);
    this._setted.reset();

    return this;
  }

  intersect(...maps: Map<K, V>[]): Map<K, V> {
    const intersection = intersectMaps(this.backingMap, ...maps);
    return AwaitableMap.from(intersection, false);
  }

  difference(...maps: Map<K, V>[]): Map<K, V> {
    const difference = differenceMaps(this.backingMap, ...maps);
    return AwaitableMap.from(difference, false);
  }

  union(...maps: Map<K, V>[]): Map<K, V> {
    const union = unionMaps(this.backingMap, ...maps);
    return AwaitableMap.from(union, false);
  }
}
