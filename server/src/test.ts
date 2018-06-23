import { AsyncEnumerable } from './common/enumerable';
import { AnyIterable, Timer } from './common/utils';

async function* counter(milliseconds: number): AsyncIterableIterator<number> {
  const timer = new Timer(true);

  let i = 0;
  while (timer.milliseconds < milliseconds) {
    yield ++i;
  }
}

(async () => {
  const enumerable = AsyncEnumerable.from(counter(1000));

  enumerable.intercept((n) => (n % 100000 == 0) ? console.log(n) : void 0).drain();
})();
