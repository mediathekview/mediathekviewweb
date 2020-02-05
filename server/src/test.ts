import { CancellationToken, createArray, currentTimestamp, getRandomString, MovingMetric, random, randomElement } from '@tstdl/base/utils';
import { MongoQueue } from '@tstdl/mongo/queue';
import { Entry } from './common/models';
import { UserActionType, VisitWithPartialId } from './common/models/user-actions';
import { InstanceProvider } from './instance-provider';
import { MongoUserActionRepository } from './repositories/mongo/user-action-repository';

// tslint:disable-next-line: no-floating-promises no-unused-expression
(async () => {

  const collection = await InstanceProvider.mongoCollection('queue');
  const queue = new MongoQueue<number>(collection, 10000, 3);
  await queue.initialize();

  // tslint:disable-next-line: no-floating-promises
  await (async () => {
    for (let i = 0; i < 0; i++) {
      const jobs = createArray(1000, () => Math.round(Math.random() * Number.MAX_SAFE_INTEGER));
      await queue.enqueueMany(jobs);
    }
  })();

  const token = new CancellationToken();
  const consumer = queue.getBatchConsumer(20, token);

  const metric = new MovingMetric(1000);

  for await (const jobs of consumer) {
    await queue.acknowledge(jobs);
    metric.add(jobs.length);
    console.log(metric.rate());
  }
});

// tslint:disable-next-line: no-floating-promises no-unused-expression
(async () => {
  const entryRepository = await InstanceProvider.entryRepository();

  const now = currentTimestamp();
  const channels = createArray(25, () => getRandomString(random(3, 15, true)));
  const topics = createArray(2500, () => getRandomString(random(5, 25, true)));
  const timestamps = createArray(75000, () => random(0, now, true));
  const durations = createArray(150, () => random(0, 1000 * 60 * 120, true));

  // tslint:disable-next-line: no-floating-promises
  await (async () => {
    for (let i = 0; i < 350; i++) {
      const entries = createArray(1000, () => randomEntry(channels, topics, timestamps, durations, now));
      await entryRepository.saveMany(entries);
    }
  })();
});

function randomEntry(channels: string[], topics: string[], timestamps: number[], durations: number[], now: number): Entry {
  const entry: Entry = {
    id: getRandomString(20),
    channel: randomElement(channels),
    topic: randomElement(topics),
    title: getRandomString(random(5, 45, true)),
    timestamp: randomElement(timestamps),
    duration: randomElement(durations),
    description: getRandomString(random(5, 500, true)),
    website: getRandomString(random(50, 100, true)),
    firstSeen: random(0, now, true),
    lastSeen: random(0, now, true),
    media: [],
    source: {
      name: 'filmliste',
      data: {
        timestamp: random(0, now, true)
      }
    }
  };
  return entry;
}

(async () => {
  const userActionsCollection = await InstanceProvider.mongoCollection('user-actions');
  const userActionsRepository = new MongoUserActionRepository(userActionsCollection);
  await userActionsRepository.initialize();

  const now = currentTimestamp();
  const userIds = createArray(75000, () => getRandomString(random(5, 20, true)));
  const pageViewIds = createArray(750000, () => getRandomString(20));
  const routes = createArray(2500, () => getRandomString(35));
  const agents = createArray(500, () => getRandomString(85));
  const languages = createArray(50, () => getRandomString(2));
  const referrers = createArray(1500, () => getRandomString(random(15, 85, true)));

  // tslint:disable-next-line: no-floating-promises
  await (async () => {
    for (let i = 0; i < 15000; i++) {
      const visits = createArray(1000, () => randomVisit(now, userIds, pageViewIds, routes, agents, languages, referrers));
      await userActionsRepository.saveMany(visits);
    }
  })();
})();

function randomVisit(now: number, userIds: string[], pageViewIds: string[], routes: string[], agents: string[], languages: string[], referrers: string[]): VisitWithPartialId {
  const visit: VisitWithPartialId = {
    actionType: UserActionType.Visit,
    userId: randomElement(userIds),
    timestamp: random(0, now, true),
    visitId: getRandomString(20),
    pageViewId: randomElement(pageViewIds),
    route: randomElement(routes),
    agent: {
      userAgent: randomElement(agents),
      language: randomElement(languages),
      resolution: {
        width: 1920,
        height: 1080
      },
      referrer: randomElement(referrers),
      timestamp: random(0, now, true)
    },
    timings: []
  };

  return visit;
}
