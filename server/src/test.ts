import { DeferredPromise } from './common/utils';
import { timedBenchmarkAsync } from './common/utils/benchmark';
import { InstanceProvider } from './instance-provider';

(async () => {
  const queueProvider = await InstanceProvider.queueProvider();

  const queue = queueProvider.get('test');

  queue.enqueueMany([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);

  queue.clean();
})();

(async () => {
  const deferredPromise = new DeferredPromise();
  deferredPromise.resolve();

  const result = await timedBenchmarkAsync(1000, () => deferredPromise);
  console.log(result);
});
