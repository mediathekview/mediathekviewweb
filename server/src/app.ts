import './common/async-iterator-symbol';

import * as Cluster from 'cluster';
import * as Http from 'http';
import { map } from 'rxjs/operators';

import { Serializer } from './serializer';
import { Filmlist } from './entry-source/filmlist/filmlist';
import { MediathekViewWebExposer } from './exposer';
import { MediathekViewWebImporter } from './importer';
import { MediathekViewWebIndexer } from './indexer';
import { InstanceProvider } from './instance-provider';
import { LoggerFactoryProvider } from './logger-factory-provider';
import { AggregationMode, EventLoopWatcher } from './utils';

const watcher = new EventLoopWatcher(10);
const logger = LoggerFactoryProvider.factory.create('[APP]');

watcher
  .watch(0, 250, AggregationMode.Maximum)
  .pipe(map((measure) => Math.round(measure * 10000) / 10000))
  .subscribe((delay) => logger.silly(`eventloop-${process.pid}: ${delay} ms`))

Serializer.registerPrototype(Filmlist);

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

(async () => {
  try {
    if (Cluster.isMaster) {
      for (let i = 0; i < 4; i++) {
        const worker = Cluster.fork();
      }
    }
    else {
      logger.info(`Worker ${process.pid} started`);
      await init();

      logger.info(`Worker ${process.pid} initialized`);
    }
  }
  catch (error) {
    logger.error(error);
  }
})();