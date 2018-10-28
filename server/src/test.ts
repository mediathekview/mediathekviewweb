import { AsyncEnumerable } from './common/enumerable';
import { Timer } from './common/utils';
import { benchmark } from './common/utils/benchmark';

/*async function* counter(milliseconds: number): AsyncIterableIterator<number> {
  const timer = new Timer(true);

  let i = 0;
  while (timer.milliseconds < milliseconds) {
    yield ++i;
  }
}

(async () => {
  const enumerable = AsyncEnumerable.from(counter(1000));

  enumerable.intercept((n) => (n % 100000 == 0) ? console.log(n) : void 0).drain();
})();*/

for (let i = 0; i < 5; i++) {
  const regex1 = /^https?:\/\/wdradaptiv-vh.akamaihd.net\/i\/medp\/ondemand\/(\S+?)\/(\S+?)\/(\d+?)\/(\d+?)\/,?([,\d_]+?),?\.mp4.*m3u8$/;
  const regex2 = /^https?:\/\/wdradaptiv-vh.akamaihd.net\/i\/medp\/ondemand\/([^\/]+?)\/([^\/]+?)\/(\d+?)\/(\d+?)\/,?([,\d_]+?),?\.mp4.*m3u8$/;

  const result1 = benchmark(10000000, () => 'https://wdradaptiv-vh.akamaihd.net/i/medp/ondemand/medp/fsk0/175/1758797/1758797_20529478.mp4.m3u8'.match(regex1))
  const result2 = benchmark(10000000, () => 'https://wdradaptiv-vh.akamaihd.net/i/medp/ondemand/medp/fsk0/175/1758797/1758797_20529478.mp4.m3u8'.match(regex2))

  console.log(JSON.stringify(result1));
  console.log(JSON.stringify(result2));

  console.log();
}