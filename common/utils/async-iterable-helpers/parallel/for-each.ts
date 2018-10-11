import { AnyIterable } from '../../any-iterable';
import { AwaitableSet } from '../../collections/awaitable';
import { ParallelizableIteratorFunction } from '../types';
import { MultiError } from '../../multi-error';

export async function parallelForEach<T>(iterable: AnyIterable<T>, concurrency: number, func: ParallelizableIteratorFunction<T, any>): Promise<void> {
  const runningPromises = new AwaitableSet<Promise<void>>();
  let thrown = false;
  const errors: any[] = [];

  function run(item: T, index: number) {
    const promise = func(item, index);
    runningPromises.add(promise);

    promise
      .then(() => runningPromises.delete(promise))
      .catch((err) => {
        errors.push(err);
        thrown = true;
        runningPromises.delete(promise);
      });
  }

  let index = 0;
  for await (const item of iterable) {
    if (thrown) {
      break;
    }

    run(item, index++);

    if (runningPromises.size >= concurrency) {
      await runningPromises.deleted;
    }
  }

  while (runningPromises.size > 0) {
    await runningPromises.deleted;
  }

  if (thrown) {
    if (errors.length > 1) {
      throw new MultiError(errors);
    } else {
      throw errors[0];
    }
  }
}
