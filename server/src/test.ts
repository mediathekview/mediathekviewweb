import { RedisSortedSet } from './data-store/redis-sorted-set';

(async () => {
  let set1 = new RedisSortedSet('set1');
  await set1.addWithScore({ member: 'member1', score: 1 });
  await set1.addWithScore({ member: 'member2', score: 2 });
  await set1.addWithScore({ member: 'member3', score: 3 });
  await set1.addWithScore({ member: 'member4', score: 4 });

  let set2 = new RedisSortedSet('set2');
  await set2.addWithScore({ member: 'member2', score: 2 });
  await set2.addWithScore({ member: 'member4', score: 4 });

  let diffSet = new RedisSortedSet('diffSet');

  await set1.diff(diffSet, [set2]);
})();
