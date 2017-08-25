import config from '../config';

import { IDatastoreProvider, ISet, IKey } from './';
import { RedisDatastoreProvider } from './redis';

(async () => {
  const provider: IDatastoreProvider = {} as any;// new RedisDatastoreProvider('localhost', 6379, 0);

  const key1 = provider.getKey<string>();

  console.log(await key1.exists());
  console.log(await key1.get());
  await key1.set('hello');
  const value = await key1.get();
  console.log(typeof value, value);
  await key1.delete();

  const set1: ISet<number> = provider.getSet();
  const set2: ISet<number> = provider.getSet('set2');
  const set3: ISet<number> = provider.getSet();

  const sets = [set1, set2, set3];

  for (let iSet = 0; iSet < 3; iSet++) {
    for (let i = 0; i < 10; i++) {
      const num = iSet * 10 + i;

      await sets[iSet].add(num);
    }
  }

  const union = provider.getSet<number>();

  console.log(await set1.pop(3));

  await set1.union(union, set2, set3);

  await set1.delete();
  await set2.delete();
  await set3.delete();

  console.log(await union.members());

  await union.delete();
})();
