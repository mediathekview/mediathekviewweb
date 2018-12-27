import * as Http from 'http';
import { MediathekViewWebRestApi } from './api/rest-api';
import './common/async-iterator-symbol';
import { Logger } from './common/logger';
import { Serializer } from './common/serializer';
import { AggregationMode, formatDuration, PeriodicSampler, timeout, Timer, cancelableTimeout } from './common/utils';
import { config } from './config';
import { Filmlist } from './entry-source/filmlist/filmlist';
import { InstanceProvider } from './instance-provider';
import { FilmlistManagerService, ImporterService, IndexerService, SaverService } from './micro-service';
import { initializeSignals, requestShutdown, shutdown, shutdownPromise } from './process-shutdown';
import { Service } from './service';

const logger = InstanceProvider.coreLogger();

let shutdownStarted = false;
shutdownPromise.then(() => shutdownStarted = true);
initializeSignals();
Serializer.registerPrototype(Filmlist);

(async () => {
  try {
    await init();
  }
  catch (error) {
    logger.error(error);
  }
})();

async function runServices(...services: Service[]) {
  logger.info('starting services');

  const runPromises = services.map((service) => service.start());
  await Promise.race(runPromises);
}

function handleApiInitializationError(error: any) {
  logger.error(error);
  requestShutdown();
}

async function connect(name: string, connectFunction: (() => Promise<any>)) {
  let success = false;
  while (!success && !shutdownStarted) {
    try {
      logger.info(`connecting to ${name}...`);
      await connectFunction();
      success = true;
      logger.info(`connected to ${name}`);
    }
    catch (error) {
      logger.warn(`error connecting to ${name}, trying again...`);
      await timeout(1000);
    }
  }
}

async function connectToDatabases() {
  const redis = InstanceProvider.redis();
  const mongo = InstanceProvider.mongo();
  const elasticsearch = InstanceProvider.elasticsearch();

  await connect('redis', async () => await redis.connect());
  await connect('mongo', async () => await mongo.connect());
  await connect('elasticsearch', async () => await await elasticsearch.ping({ requestTimeout: 250 }));
}

async function init() {
  initEventLoopWatcher(logger);

  await Promise.race([
    connectToDatabases(),
    shutdownPromise
  ]);

  if (shutdownStarted) {
    await InstanceProvider.disposeInstances();
    return;
  }

  const server = new Http.Server();
  const filmlistManagerService = new FilmlistManagerService();
  const importerService = new ImporterService();
  const saverService = new SaverService();
  const indexerService = new IndexerService();

  console.log('init')
  await Promise.all([
    filmlistManagerService.initialize(),
    importerService.initialize()
  ]);

  console.log('dispose filmlistManagerService')
  await filmlistManagerService.dispose();
  console.log('dispose importerService')
  await importerService.dispose();
  console.log('disposeInstances')
  await InstanceProvider.disposeInstances();
  console.log('requestShutdown')
  return requestShutdown();

  const api = InstanceProvider.mediathekViewWebApi();
  api.initialize().catch((error) => handleApiInitializationError(error));

  const restApi = new MediathekViewWebRestApi(api);

  server.on('request', (request: Http.IncomingMessage, response: Http.ServerResponse) => {
    restApi.handleRequest(request, response);
  });

  server.listen(config.api.port);

  for (const service of [filmlistManagerService, importerService, saverService, indexerService]) {
    service.initialize();
  }

  const skipRun = shutdownStarted;

  const runPromise = skipRun ? Promise.resolve() : Promise.race([
    filmlistManagerService.start(),
    importerService.start(),
    saverService.start(),
    indexerService.start()
  ]);

  await Promise.race([runPromise, shutdownPromise]);

  console.log('shutdown started');

  server.close();

  if (!skipRun) {
    await Promise.all([
      filmlistManagerService.stop(),
      importerService.stop(),
      saverService.stop(),
      indexerService.stop()
    ]);
  }

  console.log('dispose');
  await InstanceProvider.disposeInstances();

  console.log('bye');
}

async function measureEventLoopDelay(): Promise<number> {
  return new Promise<number>((resolve) => {
    const stopwatch = new Timer();

    setImmediate(() => {
      stopwatch.start();
      // inner setImmediate, to measure an full event-loop-cycle
      setImmediate(() => resolve(stopwatch.milliseconds));
    });
  });
}

async function initEventLoopWatcher(logger: Logger) {
  const sampler = new PeriodicSampler(measureEventLoopDelay, 1);

  sampler
    .watch(0, 5000, AggregationMode.ThirdQuartile)
    .subscribe((delay) => logger.info(`eventloop: ${formatDuration(delay, 2)}`));

  sampler.start();

  shutdown.subscribe(() => sampler.stop());
}

