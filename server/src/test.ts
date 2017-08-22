import { ILockProvider, ILock } from './lock';
import { RedisDatastoreProvider } from './data-store/redis';
import { SortedSetMember } from './data-store/';
import { RedisLockProvider } from './lock/redis';
import * as Redis from 'ioredis';
import { DistributedLoop } from './distributed-loop';
import { sleep } from './utils';

const redis = new Redis();

const datastoreProvider = new RedisDatastoreProvider(redis);

const lockProvider = new RedisLockProvider(redis);

const distributedLoop = new DistributedLoop('a-loop', lockProvider);

(async () => {

  const map = datastoreProvider.getMap('TESTMAP');
  await map.set([['bla', { hello: { yo: '3' } }], ['yo', 7]]);
  console.log((await map.getMany('bla', 'yo')));

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
