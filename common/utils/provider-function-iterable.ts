import { timeout } from './timing';

export type ProviderFunction<T> = () => ProviderFunctionResult<T> | Promise<ProviderFunctionResult<T>>;

export type ProviderFunctionResult<T> = { hasItem: boolean; item: T; } | { hasItem: false; item?: null };

export class ProviderFunctionIterable<T> implements AsyncIterable<T> {
  private readonly providerFunction: ProviderFunction<T>;
  private readonly delay: number;

  private stopped: boolean;

  constructor(providerFunction: ProviderFunction<T>, delay: number) {
    this.providerFunction = providerFunction;
    this.delay = delay;

    this.stopped = false;
  }

  stop() {
    this.stopped = true;
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
    while (!this.stopped) {
      let result = this.providerFunction();

      if (result instanceof Promise) {
        result = await result;
      }

      if (result.hasItem) {
        yield result.item;
      } else {
        await timeout(this.delay);
      }
    }
  }
}
