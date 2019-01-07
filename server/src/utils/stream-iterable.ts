import { Readable } from 'stream';
import { DeferredPromise } from '../common/utils';

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
    this.stream
      .on('readable', () => this.handleReadable())
      .on('end', () => this.handleEnd())
      .on('error', (error: Error) => this.readable.reject(error));

    while (!this.end) {
      await this.readable;
      this.readable.reset();

      while (true) {
        const chunk = this.stream.read(this.readSize) as T;

        if (chunk === null) {
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
}
