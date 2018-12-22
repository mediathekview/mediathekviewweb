import { timeout } from './common/utils';
import { InstanceProvider } from './instance-provider';
import { AsyncEnumerable } from './common/enumerable';

(async () => {
  const queueProvider = await InstanceProvider.queueProvider();
  const lockProvider = await InstanceProvider.lockProvider();

  const queue = queueProvider.get<number>('test', 5000, 3);

  const consumer = queue.getConsumer(false);

  for await (const job of consumer) {
    console.log(job);
    await timeout(100);
 //   queue.acknowledge(job);
  }
})();

(async () => {
  await timeout(1000);
  const queueProvider = await InstanceProvider.queueProvider();
  const lockProvider = await InstanceProvider.lockProvider();

  const queue = queueProvider.get<number>('test', 5000, 3);

  AsyncEnumerable.fromRange(0, 10000)
    .batch(50)
    .forEach(async (batch) => {
      await queue.enqueueMany(batch);
    });
})();
