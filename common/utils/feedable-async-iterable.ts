import { AwaitableList } from './collections/awaitable';
import { DeferredPromise } from './deferred-promise';

export class FeedableAsyncIterable<T> implements AsyncIterable<T> {
  private readonly _read: DeferredPromise<void>;
  private readonly _empty: DeferredPromise<void>;
  private _closed: boolean;
  private buffer: AwaitableList<{ item?: T, error?: Error }>;

  get read(): Promise<void> {
    return this._read;
  }

  get empty(): Promise<void> {
    return this._empty;
  }

  get closed(): boolean {
    return this._closed;
  }

  get bufferSize(): number {
    return this.buffer.size;
  }

  constructor() {
    this._closed = false;
    this.buffer = new AwaitableList();
    this._read = new DeferredPromise();
    this._empty = new DeferredPromise();
  }

  feed(item: T): void {
    if (this.closed) {
      throw new Error('closed');
    }

    this.buffer.append({ item: item });
  }

  end() {
    this._closed = true;
  }

  throw(error: Error) {
    if (this.closed) {
      throw new Error('closed');
    }

    this.buffer.append({ error: error });
    this.end();
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
    while (!this.closed || this.buffer.size > 0) {
      if (this.buffer.size == 0) {
        await this.buffer.added;
      }

      const out = this.buffer;
      this.buffer = new AwaitableList();;

      for (const { item, error } of out) {
        if (error != undefined) {
          throw error;
        }

        yield item as T;
        this._read.resolve().reset();

        if (this.buffer.size == 0) {
          this._empty.resolve().reset();
        }
      }
    }
  }
}
