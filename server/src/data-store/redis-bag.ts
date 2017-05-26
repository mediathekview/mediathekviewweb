import { IBag } from  './';

export class RedisBag<T> implements IBag<T, string> {
  namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  add(item: T): Promise<string> {
    throw new Error('not implemented');
  }

  has(item: T): Promise<boolean> {
    throw new Error('not implemented');
  }

  remove(item: T): Promise<boolean> {
    throw new Error('not implemented');
  }
}
