import * as Cluster from 'cluster';
import * as Http from 'http';
import './common/async-iterator-symbol';
import { Logger } from './common/logger';
import { formatDuration, formatError } from './common/utils';
import { config } from './config';
import { MediathekViewWebImporter } from './importer';
import { MediathekViewWebIndexer } from './indexer';
import { InstanceProvider } from './instance-provider';
import { MediathekViewWebSaver } from './saver';
import { AggregationMode, EventLoopWatcher } from './utils';

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

  filmlistManager!.run();

  importer.run();
  saver.run();
  indexer.run();
}

async function initEventLoopWatcher(logger: Logger) {
  const watcher = new EventLoopWatcher(1);

  watcher
    .watch(0, 5000, AggregationMode.ThirdQuartile)
    .subscribe((delay) => logger.info(`eventloop: ${formatDuration(delay, 2)}`));

  watcher.start();
}
