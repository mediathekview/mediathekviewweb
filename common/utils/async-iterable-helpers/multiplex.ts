import { AnyIterable } from '../any-iterable-iterator';
import { FeedableAsyncIterable } from '../feedable-async-iterable';

export function multiplex<T>(iterable: AnyIterable<T>, count: number, bufferSize: number): AsyncIterable<T>[] {
  if (bufferSize <= 0) {
    throw new Error('bufferSize must be greater than 0');
  }

  const feedableIterables: FeedableAsyncIterable<T>[] = [];

  for (let i = 0; i < count; i++) {
    const feedableIterable = new FeedableAsyncIterable<T>();
    feedableIterables.push(feedableIterable);
  }

  multiplexTo(iterable, feedableIterables, bufferSize);

  return feedableIterables;
}

async function multiplexTo<T>(input: AnyIterable<T>, outputs: FeedableAsyncIterable<T>[], bufferSize: number) {
  try {
    for await (const item of input) {
      await waitForDrain(outputs, bufferSize);
      outputs.forEach((feedableIterable) => feedableIterable.feed(item));
    }
  }
  catch (error) {
    outputs.forEach((feedableIterable) => feedableIterable.throw(error));
  }
}

async function waitForDrain(feedableIterables: FeedableAsyncIterable<any>[], bufferSize: number): Promise<void> {
  for (const feedableIterable of feedableIterables) {
    while (feedableIterable.bufferSize >= bufferSize) {
      await feedableIterable.read;
    }
  }
}
