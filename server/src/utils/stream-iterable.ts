import { Readable } from 'stream';
import { DeferredPromise } from '../common/promise';

export class StreamIterable<T> implements AsyncIterable<T> {
  private readonly stream: Readable;
  private readonly readSize: number | undefined;
  private readonly readable: DeferredPromise;

  private end: boolean;

  constructor(stream: Readable, readSize?: number) {
    this.stream = stream;
    this.readSize = readSize;

    this.end = false;
    this.readable = new DeferredPromise();
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    this.stream.on('readable', () => this.handleReadable());
    this.stream.on('end', () => this.handleEnd());
    this.stream.on('error', (error) => this.handleError(error));

    while (!this.end) {
      await this.readable;
      this.readable.reset();

      while (true) {
        const chunk = this.stream.read(this.readSize) as T;

        if (chunk == undefined) {
          break;
        }

        yield chunk;
      }
    }
  }

  private handleReadable(): void {
    if (this.readable.pending) {
      this.readable.resolve();
    }
  }

  private handleEnd(): void {
    this.end = true;

    if (this.readable.pending) {
      this.readable.resolve();
    }
  }

  private handleError(error: Error): void {
    if (this.readable.settled) {
      this.readable.reset();
    }

    this.readable.reject(error);
  }
}
