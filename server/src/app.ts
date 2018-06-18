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

async function init() {
  const server = new Http.Server();
  const exposer = new MediathekViewWebExposer(server);
  const indexer = new MediathekViewWebIndexer();
  const importer = new MediathekViewWebImporter();

  const filmlistManager = await InstanceProvider.filmlistManager();

  const lockProvider = await InstanceProvider.lockProvider();
  const lock = lockProvider.get('init');

  await lock.acquire(Number.POSITIVE_INFINITY, async () => {
    await exposer.initialize();
    await indexer.initialize();
    await importer.initialize();
  });

  exposer.expose();
  filmlistManager!.run();
  server.listen(8080);

  await Promise.all([
    indexer.run(),
    importer.run(),
  ]);
}

async function initEventLoopWatcher(logger: Logger) {
  const watcher = new EventLoopWatcher(10);

  watcher
    .watch(0, 250, AggregationMode.Maximum)
    .pipe(map((measure) => Math.round(measure * 10000) / 10000))
    .subscribe((delay) => logger.debug(`eventloop-${process.pid}: ${delay} ms`));
}

(async () => {
  const logger = await InstanceProvider.appLogger();

  initEventLoopWatcher(logger);

  try {
    if (Cluster.isMaster) {
      for (let i = 0; i < 4; i++) {
        const worker = Cluster.fork();
      }
    }
    else {
      logger.info(`worker ${process.pid} started`);

      await init();

      logger.info(`worker ${process.pid} initialized`);
    }
  }
  catch (error) {
    logger.error(error);
  }
})();