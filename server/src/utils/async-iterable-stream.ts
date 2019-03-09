import { Readable, ReadableOptions } from 'stream';
import { nextTick } from '../common/utils';

export class AsyncIterableStream extends Readable {
  private readonly iterable: AsyncIterable<any>;

  private _iterator: AsyncIterator<any> | undefined;

  get iterator(): AsyncIterator<any> {
    if (this._iterator == undefined) {
      this._iterator = this.iterable[Symbol.asyncIterator]();
    }

    return this._iterator;
  }

  constructor(iterable: AsyncIterable<any>, options?: ReadableOptions) {
    super(options);

    this.iterable = iterable;
    this._iterator = undefined;
  }

  async _read(_size: number): Promise<void> {
    try {
      let continueRead: boolean;

      do {
        const { done, value } = await this.iterator.next();

        if (done) {
          this.push(null);
        }

        continueRead = this.push(value);
      }
      while (continueRead);
    }
    catch (error) {
      await nextTick();
      this.emit('error', error);
    }
  }

  async _destroy(error: Error | null, callback?: (error: Error | null) => void): Promise<void> {
    let callbackError: Error | null = null;

    try {
      if (error != undefined && this.iterator.throw != undefined) {
        await this.iterator.throw(error);
      }
      else if (this.iterator.return != undefined) {
        await this.iterator.return();
      }
    }
    catch (error) {
      callbackError = error as Error;
    }
    finally {
      if (callback != undefined) {
        callback(callbackError);
      }
    }
  }
}
