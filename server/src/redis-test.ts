import * as Redis from 'ioredis';

const NS_PER_SEC = 1e9;

var array: number[] = [];

const redis = Redis();

setTimeout(async () => {
  for (let i = 0; i < 20000; i++) {
    var obj = Math.floor(Math.random() * 100000000);
    array.push(obj);
  }

  await redis.del('arr');

  const time = process.hrtime();

  await redis.lpush('arr', array);
  const arr = await redis.lrange('arr', 0, -1);
  console.log(arr.length)

  const diff = process.hrtime(time);
  const nanoseconds = diff[0] * NS_PER_SEC + diff[1];
  const ms = nanoseconds / 1000 / 1000;
  console.log(`Benchmark took ${ms} ms`);
}, 500);
