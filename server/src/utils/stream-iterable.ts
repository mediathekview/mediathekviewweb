import { Readable } from 'stream';
import { DeferredPromise } from '../common/utils';

export class StreamIterable<T> implements AsyncIterable<T> {
  private readonly stream: Readable;
  private readonly readSize: number | undefined;

  private end: boolean;
  private readable: DeferredPromise<void>;

  constructor(stream: Readable)
  constructor(stream: Readable, readSize: number)
  constructor(stream: Readable, readSize: number | undefined = undefined) {
    this.stream = stream;
    this.readSize = readSize;

    this.end = false;
    this.readable = new DeferredPromise();
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    this.stream
      .on('readable', () => this.readable.resolve())
      .on('end', () => this.handleEnd())
      .on('error', (error: Error) => this.readable.reject(error));

    while (!this.end) {
      await this.readable;

      let chunk;
      while ((chunk = this.stream.read(this.readSize)) != null) {
        yield chunk;
      }

      this.readable.reset();
    }
  }

  private handleEnd() {
    this.end = true;
    this.readable.resolve();
  }
}
