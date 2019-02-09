import * as Http from 'http';
import * as Net from 'net';
import { MediathekViewWebRestApi } from './api/rest-api';
import { Logger } from './common/logger';
import { Serializer } from './common/serializer';
import { AggregationMode, cancelableTimeout, formatDuration, PeriodicSampler, Timer } from './common/utils';
import { config } from './config';
import { Filmlist } from './entry-source/filmlist/filmlist';
import { InstanceProvider } from './instance-provider';
import { initializeSignals, requestShutdown, shutdownToken } from './process-shutdown';
import { Service } from './service';

type MicroService = {
  name: string;
  service: Service;
};

const logger = InstanceProvider.coreLogger();

initializeSignals();
Serializer.registerPrototype(Filmlist);

// tslint:disable-next-line: no-floating-promises
(async () => {
  try {
    await init();
  }
  catch (error) {
    logger.error(error as Error);
    requestShutdown();
  }
})();

async function startServices(services: MicroService[]): Promise<void> {
  const promises = services.map(async ({ name, service }) => {
    logger.verbose(`starting service ${name}`);
    await service.start();
  });

  await Promise.race(promises);
}

async function stopServices(services: MicroService[]): Promise<void> {
  const promises = services.map(async ({ name, service }) => {
    logger.verbose(`stopping service ${name}`);
    await service.stop();
    logger.verbose(`stopped service ${name}`);
  });

  await Promise.all(promises);
}

function getMicroServices(): MicroService[] {
  const filmlistManager = InstanceProvider.filmlistManager();
  const importer = InstanceProvider.entriesImporter();
  const saver = InstanceProvider.entriesSaver();
  const indexer = InstanceProvider.entriesIndexer();

  const microServices: MicroService[] = [
    { name: 'FilmlistManager', service: filmlistManager },
    { name: 'Importer', service: importer },
    { name: 'Saver', service: saver },
    { name: 'Indexer', service: indexer }
  ];

  return microServices;
}

function attachRestApi(server: Http.Server): void {
  const restApi = InstanceProvider.mediathekViewWebRestApi();

  server.on('request', (request: Http.IncomingMessage, response: Http.ServerResponse) => {
    restApi.handleRequest(request, response);
  });
}

async function init(): Promise<void> {
  initEventLoopWatcher(logger);

  await Promise.race([
    InstanceProvider.initialize(),
    shutdownToken
  ]);

  if (shutdownToken.isSet) {
    await InstanceProvider.disposeInstances();
    return;
  }

  const services = getMicroServices();
  const searchEngine = InstanceProvider.entrySearchEngine();
  const server = new Http.Server();
  const sockets = new Set<Net.Socket>();

  trackConnectedSockets(server, sockets);

  await searchEngine.initialize();
  attachRestApi(server);

  if (shutdownToken.isSet) {
    await InstanceProvider.disposeInstances();
    return;
  }

  logger.info(`listen on port ${config.api.port}`)
  server.listen(config.api.port);

  if (!shutdownToken.isSet) {
    logger.info('starting services');

    await Promise.race([
      startServices(services),
      shutdownToken
    ]);
  }

  logger.info('closing http server');
  const serverClosePromise = closeServer(server, sockets, 3000);

  logger.info('stopping services');
  await stopServices(services);

  logger.info('waiting for http server to be closed');
  await serverClosePromise;

  logger.info('dispose');
  await InstanceProvider.disposeInstances();

  logger.info('bye');
}

async function closeServer(server: Http.Server, sockets: Set<Net.Socket>, timeout: number): Promise<void> {
  const timer = new Timer(true);

  const closePromise = new Promise<void>((resolve, _reject) => server.close(resolve));

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
      await cancelableTimeout(1000, closePromise);
    }
  }
}

function destroySockets(sockets: Iterable<Net.Socket>): void {
  for (const socket of sockets) {
    socket.destroy();
  }
}

function trackConnectedSockets(server: Net.Server, sockets: Set<Net.Socket>): void {
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
      if (error != undefined) {
        reject(error);
        return;
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

function initEventLoopWatcher(logger: Logger): void {
  const sampler = new PeriodicSampler(measureEventLoopDelay, 50);

  sampler
    .watch(0, 100, AggregationMode.ThirdQuartile)
    .subscribe((delay) => logger.info(`eventloop: ${formatDuration(delay, 2)}`));

  sampler.start();

  shutdownToken.then(async () => await sampler.stop());
}
