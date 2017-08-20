import { ILockProvider, ILock } from './lock';
import { RedisDatastoreProvider } from './data-store/redis';
import { RedisLockProvider } from './lock/redis';
import * as Redis from 'ioredis';

const redis = new Redis();

//sortedSetCondition?: { set: ISortedSet<any>, greaterThan?: number, lessThan?: number }
const datastoreProvider = new RedisDatastoreProvider(redis);
const set = datastoreProvider.getSet('importedFilmlistTimestamps');

redis.defineCommand('zaddAggregate', {
  numberOfKeys: 1,
  lua: `local set = KEYS[1]
        local aggregator = ARGV[1]

        local i = 2
        while i <= #ARGV do
            local member = ARGV[i + 1]
            local score = tonumber(ARGV[i])
            local existingScore = tonumber(redis.call('zscore', set, member))

            local resultingScore = 0

            if (existingScore == nil) then
                resultingScore = score
            elseif (aggregator == 'MAX') then
                resultingScore = math.max(existingScore, score)
            elseif (aggregator == 'MIN') then
                resultingScore = math.min(existingScore, score)
            elseif (aggregator == 'SUM') then
                resultingScore = existingScore + score
            else
                return redis.error_reply('invalid aggregator')
            end

            redis.call('zadd', set, resultingScore, member)

            i = i + 2
        end

        return (#ARGV - 1) / 2`
});

(async () => {
  //await redis.zadd('zet', 3, 'member1');
  while(true)
   await redis['zaddAggregate']('zet', 'SUM', 9, 'member1', 30, 'member2', 100, 'member3');
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
