import { Readable } from 'stream';
import { DeferredPromise } from '../common/utils';

export class StreamIterable<T> implements AsyncIterableIterator<T> {
  private readonly stream: Readable;
  private readonly readSize: number | undefined;

  private initialized: boolean;
  private end: boolean;
  private error: Error | null;
  private readable: DeferredPromise<void>;

  constructor(stream: Readable)
  constructor(stream: Readable, readSize: number)
  constructor(stream: Readable, readSize?: number) {
    this.stream = stream;
    this.readSize = readSize;

    this.initialized = false;
    this.end = false;
    this.error = null;
    this.readable = new DeferredPromise();
  }

  private chunk: any = null;
  async next(): Promise<IteratorResult<T>> {
    if (!this.initialized) {
      this.initialized = this.initialize();
    }

    if (this.chunk == null) {
      await this.readable;
    }

    if (this.error != null) {
      throw this.error;
    }

    this.chunk = this.stream.read(this.readSize);

    if (this.chunk != null) {
      return { value: this.chunk, done: false };
    }

    this.readable.reset();

    if (!this.end) {
      return await this.next();
    }

    return { value: undefined as any, done: true };
  }

  async throw(error: any): Promise<IteratorResult<T>> {
    this.stream.destroy(error);
    return { value: error, done: true };
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
    if (!this.initialized) {
      this.initialized = this.initialize();
    }

    while (!this.end) {
      await this.readable;

      let chunk;
      while ((chunk = this.stream.read(this.readSize)) != null) {
        if (this.error != null) {
          throw this.error;
        }

        yield chunk;
      }

      this.readable.reset();
    }
  }

  destroy(error?: Error) {
    this.stream.destroy(error);
  }

  private initialize(): true {
    this.stream
      .on('readable', () => this.readable.resolve())
      .on('end', () => this.handleEnd())
      .on('error', (error: Error) => {
        this.error = error;
        this.readable.reject(error);
      });

    return true;
  }

  private handleEnd(): void {
    this.end = true;
    this.readable.resolve();
  }
}
