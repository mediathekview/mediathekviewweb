import { InstanceProvider } from './instance-provider';
import { timeout } from './common/utils';

(async () => {
  await connectToDatabases();

  const loopProvider = InstanceProvider.distributedLoopProvider();

  const loop = loopProvider.get('test');

  loop.run(async () => console.log('hi'), 5000, 1000);
})();

async function connectToDatabases() {
  const redis = InstanceProvider.redis();
  const mongo = InstanceProvider.mongo();
  const elasticsearch = InstanceProvider.elasticsearch();

  await connect('redis', async () => await redis.connect());
  await connect('mongo', async () => await mongo.connect());
  await connect('elasticsearch', async () => await await elasticsearch.ping({ requestTimeout: 250 }));
}

async function connect(name: string, connectFunction: (() => Promise<any>)) {
  let success = false;
  while (!success) {
    try {
      console.info(`connecting to ${name}...`);
      await connectFunction();
      success = true;
      console.info(`connected to ${name}`);
    }
    catch (error) {
      console.error(error);
      await timeout(1000);
    }
  }
}
