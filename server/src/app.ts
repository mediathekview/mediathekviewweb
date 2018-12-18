import * as Cluster from 'cluster';
import * as Http from 'http';
import { Subject } from 'rxjs';
import './common/async-iterator-symbol';
import { Logger } from './common/logger';
import { AggregationMode, formatDuration, formatError, PeriodicSampler, Timer } from './common/utils';
import { config } from './config';
import { MediathekViewWebImporter } from './importer';
import { MediathekViewWebIndexer } from './indexer';
import { InstanceProvider } from './instance-provider';
import { MediathekViewWebSaver } from './saver';

type Signal = 'SIGTERM' | 'SIGINT' | 'SIGHUP' | 'SIGBREAK';
const QUIT_SIGNALS: Signal[] = ['SIGTERM', 'SIGINT', 'SIGHUP', 'SIGBREAK'];

const quitSubject = new Subject<void>();

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
  const importer = new MediathekViewWebImporter();
  const saver = new MediathekViewWebSaver();
  const indexer = new MediathekViewWebIndexer();

  const restApi = await InstanceProvider.mediathekViewWebRestApi();

  server.on('request', (request: Http.IncomingMessage, response: Http.ServerResponse) => {
    restApi.handleRequest(request, response);
  });

  server.listen(config.api.port);

  const filmlistManager = await InstanceProvider.filmlistManager();
  const lockProvider = await InstanceProvider.lockProvider();

  const lock = lockProvider.get('init');

  await lock.acquire(Number.POSITIVE_INFINITY, async () => {
    await importer.initialize();
    await saver.initialize();
    await indexer.initialize();
  });

  filmlistManager.run();
  importer.run();
  saver.run();
  indexer.run();
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

for (const signal in QUIT_SIGNALS) {
  process.on(signal as Signal, (signal) => {
    console.info(`${signal} received, quitting.`);
    quit();
  });
}
