import { Injectable } from '@angular/core';
import { Enumerable } from '@tstdl/base/enumerable';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  set(namespace: string, key: string, value: any): void {
    const serializedValue = JSON.stringify(value);
    const storageKey = `${namespace}:${key}`;

    localStorage.setItem(storageKey, serializedValue);
  }

  get<T>(namespace: string, key: string): T | undefined {
    const storageKey = `${namespace}:${key}`;

    try {
      const serializedValue = localStorage.getItem(storageKey);

      if (serializedValue != undefined) {
        const value = JSON.parse(serializedValue);
        return value;
      }
    }
    catch (error) {
      console.error(error);
    }

    return undefined;
  }

  keys(namespace: string): Iterable<string> {
    return Enumerable.fromRange(0, localStorage.length - 1)
      .map((index) => localStorage.key(index) as string)
      .filter((key) => key.startsWith(`${namespace}:`))
      .map((key) => key.substring(namespace.length + 1));
  }

  entries(namespace: string): Iterable<[string, unknown]> {
    const keys = this.keys(namespace);

    return Enumerable.from(keys)
      .map((key) => [key, this.get(namespace, key)] as [string, unknown]);
  }
}
