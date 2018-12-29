import * as Http from 'http';
import * as Net from 'net';
import { MediathekViewWebRestApi } from './api/rest-api';
import { Logger } from './common/logger';
import { Serializer } from './common/serializer';
import { AggregationMode, cancelableTimeout, formatDuration, PeriodicSampler, Timer } from './common/utils';
import { config } from './config';
import { Filmlist } from './entry-source/filmlist/filmlist';
import { InstanceProvider } from './instance-provider';
import { FilmlistManagerService, ImporterService, IndexerService, SaverService } from './micro-service';
import { initializeSignals, requestShutdown, shutdown, shutdownPromise } from './process-shutdown';
import { MicroService, Service } from './service';

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
    requestShutdown();
  }
})();

async function initializeServices(services: MicroService[]) {
  const promises = services.map((service) => {
    logger.verbose(`initializing service ${service.name}`);

    const promise = service.initialize();
    promise.then(() => logger.verbose(`initialized service ${service.name}`));

    return promise;
  });

  await Promise.all(promises);
}

async function startServices(services: MicroService[]) {
  const promises = services.map((service) => {
    logger.verbose(`starting service ${service.name}`);

    const promise = service.start();

    return promise;
  });

  await Promise.race(promises);
}

async function disposeServices(services: MicroService[]) {
  const promises = services.map((service) => {
    logger.verbose(`stopping service ${service.name}`);

    const promise = service.dispose();
    promise.then(() => logger.verbose(`stopped service ${service.name}`));

    return promise;
  });

  await Promise.all(promises);
}

function getMicroServices(): MicroService[] {
  const filmlistManagerService = new FilmlistManagerService();
  const importerService = new ImporterService();
  const saverService = new SaverService();
  const indexerService = new IndexerService();

  return [filmlistManagerService, importerService, saverService, indexerService];
}

async function initializeApi(server: Http.Server): Promise<void> {
  const api = InstanceProvider.mediathekViewWebApi();
  const restApi = new MediathekViewWebRestApi(api);

  server.on('request', (request: Http.IncomingMessage, response: Http.ServerResponse) => {
    restApi.handleRequest(request, response);
  });
}

async function init() {
  initEventLoopWatcher(logger);

  await Promise.race([
    InstanceProvider.initialize(),
    shutdownPromise
  ]);

  if (shutdownStarted) {
    await InstanceProvider.disposeInstances();
    return;
  }

  const services = getMicroServices();
  const searchEngine = InstanceProvider.entrySearchEngine();
  const server = new Http.Server();
  const sockets = new Set<Net.Socket>();

  trackConnectedSockets(server, sockets);

  await searchEngine.initialize();
  initializeApi(server);

  if (shutdownStarted) {
    await InstanceProvider.disposeInstances();
    return;
  }

  logger.info(`listen on port ${config.api.port}`)
  server.listen(config.api.port);

  logger.info('initializing services');
  await initializeServices(services);

  if (!shutdownStarted) {
    logger.info('starting services');
    await Promise.race([
      startServices(services),
      shutdownPromise
    ]);
  }

  logger.info('closing http server');
  const serverClosePromise = closeServer(server, sockets, 3000);

  logger.info('stopping services');
  await disposeServices(services);

  logger.info('waiting for http server to be closed');
  await serverClosePromise;

  logger.info('dispose');
  await InstanceProvider.disposeInstances();

  logger.info('bye');
}

async function closeServer(server: Http.Server, sockets: Set<Net.Socket>, timeout: number): Promise<void> {
  const timer = new Timer(true);

  const closePromise = new Promise<void>((resolve, _reject) => server.close(() => resolve()));

  while (true) {
    const connections = await getConnections(server);

    if (connections == 0) {
      break;
    }

    if (timer.milliseconds >= timeout) {
      logger.info(`force closing remaining sockets after waiting for ${timeout} milliseconds`);
      destroySockets(sockets);
      break;
    }

    if (connections > 0) {
      logger.info(`waiting for ${connections} to end`);
      await cancelableTimeout(closePromise, 1000, true);
    }
  }
}

function destroySockets(sockets: Iterable<Net.Socket>) {
  for (const socket of sockets) {
    socket.destroy();
  }
}

function trackConnectedSockets(server: Net.Server, sockets: Set<Net.Socket>) {
  server.on('connection', (socket) => {
    sockets.add(socket);

    socket.on('close', () => {
      sockets.delete(socket);
    });
  });
}

async function getConnections(server: Http.Server): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    server.getConnections((error, count) => {
      if (error != null) {
        return reject(error);
      }

      resolve(count);
    });
  });
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
  const sampler = new PeriodicSampler(measureEventLoopDelay, 50);

  sampler
    .watch(0, 100, AggregationMode.ThirdQuartile)
    .subscribe((delay) => logger.info(`eventloop: ${formatDuration(delay, 2)}`));

  sampler.start();

  shutdown.subscribe(() => sampler.stop());
}

