import { AnyIterable } from '../../';
import { ParallelizableIteratorFunction } from '../types';
import { AwaitableSet } from '../../collections/awaitable';

export async function parallelForEach<T>(iterable: AnyIterable<T>, concurrency: number, func: ParallelizableIteratorFunction<T, void>): Promise<void> {
  const runningPromises = new AwaitableSet<Promise<void>>();
  let thrown = false;
  let error: any;

  function run(item: T, index: number) {
    const promise = func(item, index);
    runningPromises.add(promise);

    promise
      .then(() => runningPromises.delete(promise))
      .catch((err) => {
        error = err;
        thrown = true;
        runningPromises.delete(promise);
      });
  }

  let index = 0;
  for await (const item of iterable) {
    if (thrown) {
      throw error;
    }
    
    run(item, index++);

    if (runningPromises.size >= concurrency) {
      await runningPromises.deleted;
    }
  }

  while (runningPromises.size > 0) {
    await runningPromises.deleted;
  }
}
