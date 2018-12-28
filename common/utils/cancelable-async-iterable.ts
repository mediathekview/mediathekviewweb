import { AnyIterable } from './any-iterable-iterator';
import { iterableToAsyncIterator } from './async-iterable-helpers/to-iterator';
import { cancelablePromise } from './cancelable-promise';

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

    const cancelabledIterator: AsyncIterator<T> = {
      return: (value?: any) => iterator.return!(value),
      throw: (e?: any) => iterator.throw!(e),
      next: async (value?: any) => {
        if (stop) {
          return { done: true, value: undefined as any };
        }

        if (hasError) {
          throw error;
        }

        const nextPromise = iterator.next(value);
        const result = await cancelablePromise(nextPromise, this.cancelationPromise);

        if (result.canceled) {
          return { done: true, value: undefined as any };
        }

        return result.value;
      }
    };

    return cancelabledIterator;
  }
}
