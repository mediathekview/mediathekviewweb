import { ResetPromise } from './reset-promise';
import { AwaitableList } from './collections/awaitable';
import { AnyIterable } from './any-iterable';

export class FeedableAsyncIterable<T> implements AsyncIterable<T> {
  private _closed: boolean;
  private buffer: AwaitableList<{ item?: T, error?: Error }>;

  read: ResetPromise<void>;
  empty: ResetPromise<void>;

  get closed(): boolean {
    return this._closed;
  }

  get bufferSize(): number {
    return this.buffer.size;
  }

  constructor() {
    this._closed = false;
    this.buffer = new AwaitableList();
    this.read = new ResetPromise();
    this.empty = new ResetPromise();
  }

  feed(item: T): void {
    if (this.closed) {
      throw new Error('closed');
    }

    this.buffer.push({ item: item });
  }

  end() {
    this._closed = true;
  }

  throw(error: Error) {
    if (this.closed) {
      throw new Error('closed');
    }

    this.buffer.push({ error: error });
    this.end();
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
    while (!this.closed || this.buffer.size > 0) {
      if (this.buffer.size == 0) {
        await this.buffer.added;
      }

      const out = this.buffer;
      this.buffer = new AwaitableList();;

      for (const item of out) {

        if (item.error != undefined) {
          throw item.error;
        }

        yield item.item as T;
        this.read.resolve().reset();

        if (this.buffer.size == 0) {
          this.empty.resolve().reset();
        }
      }
    }
  }
} 