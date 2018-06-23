import { Timer, timeout } from './common/utils';

async function* counter(): AsyncIterableIterator<number> {
  const timer = new Timer(true);

  let i = 0;
  while (timer.milliseconds < 1) {
    yield ++i;
  }
}

async function* passThrough<T>(iterable: AsyncIterable<T>): AsyncIterableIterator<T> {
  yield* iterable;
}

async function test() {
  let iterable = counter();

  for (let i = 0; i < 20; i++) {
    iterable = passThrough(iterable);
  }

  let end = 0;

  for await (const i of iterable) {
    end = i;
  }

  console.log(end);
}

(async () => {
  const timer = new Timer(true);

  console.log(timer.milliseconds);
  //test();
})();