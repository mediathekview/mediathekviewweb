import { Readable } from 'stream';
import { ResetPromise } from '../common/utils';

export class StreamIterable<T> implements AsyncIterable<T> {
  private readonly stream: Readable;
  private readonly readSize: number | undefined;

  private end: boolean;
  private resetPromise: ResetPromise<void>;

  constructor(stream: Readable)
  constructor(stream: Readable, readSize: number)
  constructor(stream: Readable, readSize: number | undefined = undefined) {
    this.stream = stream;
    this.readSize = readSize;

    this.end = false;
    this.resetPromise = new ResetPromise();
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    this.stream
      .on('readable', () => this.resetPromise.resolve())
      .on('end', () => this.handleEnd())
      .on('error', (error: Error) => this.resetPromise.reject(error));

    while (!this.end) {
      await this.resetPromise;

      let chunk;
      while ((chunk = this.stream.read(this.readSize)) != null) {
        yield chunk;
      }

      this.resetPromise.reset();
    }
  }

  private handleEnd() {
    this.end = true;
    this.resetPromise.resolve();
  }
}
