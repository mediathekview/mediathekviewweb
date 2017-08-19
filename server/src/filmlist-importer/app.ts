import { MVWArchiveFilmlistProvider } from './mvw-archive-filmlist-provider';
import { FilmlistManager } from './filmlist-manager';
import { FilmlistImporter } from './filmlist-importer';
import { ILockProvider } from '../lock';
import { RedisLockProvider } from '../lock/redis';
import * as Redis from 'ioredis';
import { QueueProvider } from '../queue';
import config from '../config';

import { IDatastoreProvider } from '../data-store';
import { RedisDatastoreProvider } from '../data-store/redis';

(<any>Symbol).asyncIterator = Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator");

const REDIS_OPTIONS: Redis.RedisOptions = { host: config.redis.host, port: config.redis.port, db: config.redis.db };

const redis = new Redis(REDIS_OPTIONS);

const filmlistProvider = new MVWArchiveFilmlistProvider();
const datastoreProvider: IDatastoreProvider = new RedisDatastoreProvider(redis);
const lockProvider: ILockProvider = new RedisLockProvider(redis);
const queueProvider: QueueProvider = new QueueProvider(REDIS_OPTIONS);

(async () => {
  try {
    const manager = new FilmlistManager(datastoreProvider, filmlistProvider, lockProvider, queueProvider);
    const importer = new FilmlistImporter(datastoreProvider, queueProvider);

    manager.run();
    importer.run();
  }
  catch (error) {
    console.error(error);
  }
})();
