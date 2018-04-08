import { AnyIterable } from '../../any-iterable';
import { AwaitableSet } from '../../collections/awaitable';
import { ParallelizableIteratorFunction } from '../types';

export async function parallelForEach<T>(iterable: AnyIterable<T>, concurrency: number, func: ParallelizableIteratorFunction<T, any>): Promise<void> {
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
