import { benchmark } from './utils/benchmark';

(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.for('Symbol.asyncIterator');


(async () => {
  const result = benchmark(100000, () => {
  });

  console.log(result);
})();

function test() {
  console.log(test.name);
}

test();