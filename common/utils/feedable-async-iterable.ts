import { AwaitableList } from './collections/awaitable';
import { ResetPromise } from './reset-promise';

export class FeedableAsyncIterable<T> implements AsyncIterable<T> {
  private readonly _read: ResetPromise<void>;
  private readonly _empty: ResetPromise<void>;
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
    this._read = new ResetPromise();
    this._empty = new ResetPromise();
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
        this._read.resolve().reset();

        if (this.buffer.size == 0) {
          this._empty.resolve().reset();
        }
      }
    }
  }
} 