import { HighPrecisionTimer } from './utils';
import { forEachAsync, mapAsync } from './common/utils';

(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.for('Symbol.asyncIterator');

async function* counter(to: number) {
  for (let i = 0; i <= to; i++) {
    yield i;
  }
}

(async () => {
  const mapped = mapAsync(counter(100000), (i) => i * 3);

  const result = await HighPrecisionTimer.measure(async () => {
    for await (const i of mapped) {
      console.log(i);
    }
  });

  console.log(result);
})();