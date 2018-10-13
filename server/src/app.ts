import * as Cluster from 'cluster';
import * as Http from 'http';
import { map } from 'rxjs/operators';

import './common/async-iterator-symbol';
import { Logger } from './common/logger';
import { MediathekViewWebExposer } from './exposer';
import { MediathekViewWebImporter } from './importer';
import { MediathekViewWebIndexer } from './indexer';
import { InstanceProvider } from './instance-provider';
import { AggregationMode, EventLoopWatcher } from './utils';
import { MediathekViewWebSaver } from './saver';
import { formatDuration, formatError } from './common/utils';

(async () => {
  const logger = await InstanceProvider.coreLogger();

  handleUncaughtExceptions(logger);
  initEventLoopWatcher(logger);

  try {
    if (Cluster.isMaster) {
      for (let i = 0; i < 1; i++) {
        const worker = Cluster.fork();
        logger.info(`worker ${worker.id} forked`);
      }
    }
    else {
      logger.info(`worker started`);

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
  const exposer = new MediathekViewWebExposer(server);
  const importer = new MediathekViewWebImporter();
  const saver = new MediathekViewWebSaver();
  const indexer = new MediathekViewWebIndexer();

  const filmlistManager = await InstanceProvider.filmlistManager();

  const lockProvider = await InstanceProvider.lockProvider();
  const lock = lockProvider.get('init');

  await lock.acquire(Number.POSITIVE_INFINITY, async () => {
    await exposer.initialize();
    await importer.initialize();
    await saver.initialize();
    await indexer.initialize();
  });

  exposer.expose();
  filmlistManager!.run();
  server.listen(8080);

  importer.run();
  saver.run();
  indexer.run();
}

async function initEventLoopWatcher(logger: Logger) {
  const watcher = new EventLoopWatcher(1);

  watcher
    .watch(0, 1000, AggregationMode.ThirdQuartile)
    .subscribe((delay) => logger.info(`eventloop: ${formatDuration(delay, 4)}`));

  watcher.start();
}