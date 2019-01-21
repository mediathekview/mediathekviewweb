import { cancelablePromise } from '../promise/cancelable-promise';
import { AnyIterable } from './any-iterable-iterator';
import { iterableToAsyncIterator } from './async-iterable-helpers/to-iterator';

export class CancelableAsyncIterable<T> implements AsyncIterable<T> {
  private readonly source: AnyIterable<T>;
  private readonly cancelationPromise: Promise<void>;

  constructor(source: AnyIterable<T>, cancelationPromise: Promise<void>) {
    this.source = source;
    this.cancelationPromise = cancelationPromise;
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    const iterator = iterableToAsyncIterator(this.source);

    let stop = false;
    let error: any;
    let hasError = false;

    this.cancelationPromise
      .then(() => stop = true)
      .catch((reason) => {
        error = reason;
        hasError = true;
      });

    // tslint:disable: no-non-null-assertion promise-function-async no-object-literal-type-assertion
    const cancelabledIterator: AsyncIterator<T> = {
      return: (value?: any) => iterator.return!(value),
      throw: (e?: any) => iterator.throw!(e),
      next: async (value?: any) => {
        if (stop) {
          await iterator.return!();
          return { done: true } as IteratorResult<T>;
        }

        if (hasError) {
          throw error;
        }

        const nextPromise = iterator.next(value);
        const result = await cancelablePromise(nextPromise, this.cancelationPromise);

        if (result.canceled) {
          stop = true;
          await iterator.return!();
          return { done: true } as IteratorResult<T>;
        }

        return result.value;
      }
    };

    return cancelabledIterator;
  }
}
