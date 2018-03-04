import { ResetPromise } from './reset-promise';
import { AwaitableList } from './collections/awaitable';
import { AnyIterable } from './any-iterable';

export class BufferedAsyncIterable<T> implements AsyncIterable<T> {
  private source: AnyIterable<T>;
  private size: number;
  private buffer: AwaitableList<T>;
  private end: boolean = false;

  constructor(source: AnyIterable<T>, size: number) {
    this.source = source;
    this.size = Math.max(size, 1);

    this.buffer = new AwaitableList();
  }

  get fillRatio(): number {
    return this.buffer.size / this.size;
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
    this.read();

    while (!this.end || this.buffer.size > 0) {
      const waitForSource = !this.end && this.buffer.size == 0;

      if (waitForSource) {
        await this.buffer.added;
      }

      const element = this.buffer.shift() as T;
      yield element;
    }
  }

  private async read() {
    for await (const element of this.source) {
      this.buffer.push(element);

      if (this.buffer.size >= this.size) {
        await this.buffer.removed;
      }
    }

    this.end = true;
  }
}
