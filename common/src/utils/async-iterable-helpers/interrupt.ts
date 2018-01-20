import { AnyIterable, interrupt } from "../";

export async function* interruptEveryAsync<T>(iterable: AnyIterable<T>, every: number): AsyncIterableIterator<T> {
  let counter = 0;

  for await (const item of iterable) {
    if ((counter++ % every) == 0) {
      await interrupt();
    }

    yield item;
  }
}