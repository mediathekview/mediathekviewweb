import { InstanceProvider } from './instance-provider';

(async () => {
  const queueProvider = await InstanceProvider.queueProvider();

  const queue = queueProvider.get('test', 5);

  queue.enqueueMany([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);

  queue.clear();
});

(async () => {
})();
