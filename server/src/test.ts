import { ILockProvider, ILock } from './lock';
import { RedisLockProvider } from './lock/redis';
import * as Redis from 'ioredis';

const redis = new Redis();

const lockProvider: ILockProvider = new RedisLockProvider(redis);

const lock1 = lockProvider.getLock('lock');
const lock2 = lockProvider.getLock('lock');


(async () => {

  console.log(await lock1.haslock());
  console.log(await lock1.unlock());

  await lock1.lock(1000);

  let hasLock = await lock1.haslock();
  while (hasLock) {
    hasLock = await lock1.haslock();
    console.log(true);
  }

  console.log(false)
})();

/*(<any>Symbol).asyncIterator = Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator");
const sleep = async (ms: number) => new Promise((resolve, reject) => setTimeout(() => resolve(), ms));

async function* g(count: number) {
  for (let i = 0; i < count; i++) {
    yield* (async function* () {
      await sleep(100);
      yield i;
    })();
  }
}

async function f() {
  for await (const x of g(100)) {
    console.log(x);
  }
}

f();
*/
