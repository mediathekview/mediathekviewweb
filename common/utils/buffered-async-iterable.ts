import { AnyIterable } from './any-iterable-iterator';
import { AwaitableList } from './collections/awaitable';
import { DeferredPromise } from '../promise/deferred-promise';
import { CustomError } from './custom-error';

export class BufferedAsyncIterableError<T> extends CustomError {
  readonly unyieldedItems: T[];
  readonly innerError: Error;

  get name(): string {
    return this.innerError.name;
  }

  get stack(): string | undefined {
    return this.innerError.stack;
  }

  constructor(unyieldedItems: T[], innerError: Error) {
    super(`iterator error: ${innerError.message}`);

    this.unyieldedItems = unyieldedItems;
    this.innerError = innerError;
  }
}

export class BufferedAsyncIterable<T> implements AsyncIterable<T> {
  private readonly source: AnyIterable<T>;
  private readonly size: number;
  private readonly buffer: AwaitableList<T>;
  private readonly stopPromise: DeferredPromise;

  private endPromise = new DeferredPromise();
  private end: boolean = false;
  private stop: boolean = false;
  private hasError: boolean = false;
  private error: any;

  constructor(source: AnyIterable<T>, size: number) {
    if (size <= 0) {
      throw new Error('size must be greater than 0');
    }

    this.source = source;
    this.size = size;

    this.buffer = new AwaitableList();
    this.stopPromise = new DeferredPromise();
  }

  get fillRatio(): number {
    return this.buffer.size / this.size;
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
    this.read();

    try {
      while (!this.end || this.buffer.size > 0) {
        const waitForSource = !this.end && this.buffer.size == 0;

        if (waitForSource) {
          await Promise.race([this.buffer.added, this.endPromise]);

          if (this.end) {
            break;
          }
        }

        const element = this.buffer.shift();
        yield element;
      }
    }
    catch (error) {
      this.hasError = true;
      this.error = new BufferedAsyncIterableError([...this.buffer], error);
    }
    finally {
      this.stop = true;
      this.stopPromise.resolve();
    }
  }

  private async read() {
    for await (const element of this.source) {
      this.buffer.append(element);

      if (this.buffer.size >= this.size) {
        await Promise.race([this.buffer.removed, this.stopPromise]);
      }

      if (this.hasError) {
        throw this.error;
      }

      if (this.stop) {
        return;
      }
    }

    this.end = true;
    this.endPromise.resolve();
  }
}
