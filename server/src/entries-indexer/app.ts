import { IndexerManager } from './indexer-manager';
import { IEntry } from '../common';
import { EntriesIndexer } from './entries-indexer';
import { ElasticsearchSearchEngine } from '../search-engine/elasticsearch';
import { ILockProvider } from '../lock';
import { RedisLockProvider } from '../lock/redis';
import * as Redis from 'ioredis';
import config from '../config';
import { QueueProvider } from '../queue';
import * as Elasticsearch from 'elasticsearch';
import * as ElasticsearchDefinitions from '../elasticsearch-definitions';

process.on('unhandledRejection', (reason) => {
  console.error((reason as Error).stack);
});

import { IDatastoreProvider } from '../data-store';
import { RedisDatastoreProvider } from '../data-store/redis';

const REDIS_OPTIONS: Redis.RedisOptions = { host: config.redis.host, port: config.redis.port, db: config.redis.db };

const redis = new Redis(REDIS_OPTIONS);

const datastoreProvider: IDatastoreProvider = new RedisDatastoreProvider(redis);
const lockProvider: ILockProvider = new RedisLockProvider(redis);
const queueProvider: QueueProvider = new QueueProvider(REDIS_OPTIONS);

const elasticsearchClient = new Elasticsearch.Client({ host: '127.0.0.1:9200' });

const searchEngine = new ElasticsearchSearchEngine<IEntry>('mediathekviewweb', 'entry', elasticsearchClient, ElasticsearchDefinitions.ElasticsearchSettings, ElasticsearchDefinitions.ElasticsearchMapping);
const indexerManager = new IndexerManager(datastoreProvider, lockProvider, queueProvider);
const entriesIndexer = new EntriesIndexer(datastoreProvider, searchEngine, queueProvider);

indexerManager.run();
entriesIndexer.run();
