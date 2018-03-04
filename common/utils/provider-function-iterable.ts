import { FeedableAsyncIterable } from './feedable-async-iterable';

export type ProviderFunction<T> = () => T | Promise<T>;

export class ProviderFunctionIterable<T> implements AsyncIterable<T> {
  private readonly bufferSize: number;
  private readonly providerFunction: ProviderFunction<T>;

  private readonly out: FeedableAsyncIterable<T>;
  private startedReading: boolean = false;

  constructor(bufferSize: number, providerFunction: ProviderFunction<T>) {
    this.bufferSize = bufferSize;
    this.providerFunction = providerFunction;

    this.out = new FeedableAsyncIterable();
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    if (!this.startedReading) {
      this.read();
      this.startedReading = true;
    }

    return this.out[Symbol.asyncIterator]();
  }

  private async read() {
    while (true) {
      while (this.out.bufferSize >= this.bufferSize) {
        await this.out.read;
      }

      try {
        const item = await this.providerFunction();
        this.out.feed(item);
      }
      catch (error) {
        this.out.throw(error);
        return;
      }
    }
  }
}
