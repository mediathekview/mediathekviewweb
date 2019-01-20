import { List } from 'immutable';
import { compareByValue } from './common/utils';
import { timedBenchmark } from './common/utils/benchmark';

console.log(timedBenchmark(1000, () => {
  const array: number[] = [];

  for (let i = 10000; i > 0; i--) {
    array.push(i);

    if (i % 100 == 0) {
      const sorted = [...array].sort(compareByValue);
    }
  }
}));

console.log(timedBenchmark(1000, () => {
  let list: List<number> = List();

  for (let i = 10000; i > 0; i--) {
    list = list.push(i);

    if (i % 100 == 0) {
      const sorted = list.sort();
    }
  }
}));
