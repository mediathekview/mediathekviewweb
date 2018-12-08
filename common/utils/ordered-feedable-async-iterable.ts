import { AwaitableMap } from './collections/awaitable';
import { FeedableAsyncIterable } from './feedable-async-iterable';

export class OrderedFeedableAsyncIterable<T> implements AsyncIterable<T> {
  private readonly inBuffer = new AwaitableMap<number, T>();
  private readonly out = new FeedableAsyncIterable<T>();

  private currentIndex: number = 0;

  get read(): Promise<void> {
    return this.out.read;
  }

  get empty(): Promise<void> {
    return this.out.empty;
  }

  get closed(): boolean {
    return this.out.closed;
  }

  feed(item: T, index: number): void {
    if (this.out.closed) {
      throw new Error('closed');
    }

    this.inBuffer.set(index, item);

    this.dispatch();
  }

  end() {
    this.out.end();
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    return this.out[Symbol.asyncIterator]();
  }

  private dispatch() {
    while (this.inBuffer.has(this.currentIndex)) {
      const item = this.inBuffer.get(this.currentIndex++) as T;
      this.out.feed(item);
    }
  }
}
