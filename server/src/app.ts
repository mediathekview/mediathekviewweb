import * as Cluster from 'cluster';
import * as Http from 'http';
import { Subject } from 'rxjs';
import './common/async-iterator-symbol';
import { Logger } from './common/logger';
import { Serializer } from './common/serializer';
import { AggregationMode, formatDuration, formatError, PeriodicSampler, Timer } from './common/utils';
import { config } from './config';
import { Filmlist } from './entry-source/filmlist/filmlist';
import { InstanceProvider } from './instance-provider';
import { FilmlistManagerService } from './service/filmlist-manager';
import { ImporterService } from './service/importer';
import { MediathekViewWebIndexer } from './service/indexer';
import { SaverService } from './service/saver';

type Signal = 'SIGTERM' | 'SIGINT' | 'SIGHUP' | 'SIGBREAK';
const QUIT_SIGNALS: Signal[] = ['SIGTERM', 'SIGINT', 'SIGHUP', 'SIGBREAK'];

const quitSubject = new Subject<void>();

Serializer.registerPrototype(Filmlist);

(async () => {
  const logger = await InstanceProvider.coreLogger();

  handleUncaughtExceptions(logger);

  try {
    if (Cluster.isMaster) {
      for (let i = 0; i < 1; i++) {
        const worker = Cluster.fork();
        logger.info(`worker ${worker.id} forked`);
      }
    }
    else {
      logger.info(`worker started`);

      initEventLoopWatcher(logger);
      await init();

      logger.info(`worker initialized`);
    }
  }
  catch (error) {
    logger.error(error);
  }
})();

function handleUncaughtExceptions(logger: Logger) {
  process.on('uncaughtException', (error) => {
    const message = formatError(error, true);
    logger.error(`uncaught: ${message}`);
  });
}

async function init() {
  const server = new Http.Server();
  const filmlistManagerService = new FilmlistManagerService();
  const importerService = new ImporterService();
  const saverService = new SaverService();
  const indexerService = new MediathekViewWebIndexer();

  const restApi = await InstanceProvider.mediathekViewWebRestApi();

  server.on('request', (request: Http.IncomingMessage, response: Http.ServerResponse) => {
    restApi.handleRequest(request, response);
  });

  server.listen(config.api.port);

  const lockProvider = await InstanceProvider.lockProvider();

  const lock = lockProvider.get('init');

  await lock.acquire(Number.POSITIVE_INFINITY, async () => {
    await Promise.all([
      filmlistManagerService.initialize(),
      importerService.initialize(),
      saverService.initialize(),
      indexerService.initialize()
    ]);
  });

  (async () => {
    const runPromise = Promise.all([
      filmlistManagerService.run(),
      importerService.run(),
      saverService.run(),
      indexerService.run()
    ]);

    const quitPromise = quitSubject.toPromise();

    await Promise.race([runPromise, quitPromise]);

    console.log('shutdown');

    server.close();

    await Promise.all([
      filmlistManagerService.stop(),
      importerService.stop(),
      saverService.stop(),
      indexerService.stop()
    ]);

    await InstanceProvider.disposeInstances();

    console.log('bye');
  })();
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

  quitSubject.subscribe(() => sampler.stop());
}

function quit() {
  quitSubject.next();
  quitSubject.complete();

  const timeout = setTimeout(() => {
    console.error('forcefully quitting after 10 seconds...');
    process.exit(1);
  }, 10000);

  timeout.unref();
}

process.on('uncaughtException', (error: Error) => {
  console.error('uncaughtException', error);
  quit();
});

process.on('multipleResolves', (type, promise, reason) => {
  console.error('multipleResolves', type, promise, reason);
  quit();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('unhandledRejection', promise, reason);
  quit();
});

process.on('rejectionHandled', (promise) => {
  console.error('rejectionHandled', promise);
});

for (const signal of QUIT_SIGNALS) {
  process.on(signal as Signal, (signal) => {
    console.info(`${signal} received, quitting.`);
    quit();
  });
}
