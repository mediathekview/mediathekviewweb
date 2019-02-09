import { Client as ElasticsearchClient } from 'elasticsearch';
import * as RedisClient from 'ioredis';
import { Redis } from 'ioredis';
import * as Mongo from 'mongodb';
import { MediathekViewWebApi } from './api/api';
import { MediathekViewWebRestApi } from './api/rest-api';
import { AsyncDisposer } from './common/disposable';
import { LockProvider } from './common/lock';
import { Logger, LogLevel } from './common/logger';
import { ConsoleLogger } from './common/logger/console';
import { AggregatedEntry } from './common/model';
import { SearchEngine } from './common/search-engine';
import { StringMap } from './common/types';
import { timeout } from './common/utils';
import { config } from './config';
import { DatastoreFactory } from './datastore';
import { RedisDatastoreFactory } from './datastore/redis';
import { DistributedLoopProvider } from './distributed-loop';
import { ElasticsearchMapping, ElasticsearchSettings, textTypeFields } from './elasticsearch-definitions';
import { EntriesImporter } from './entries-importer/importer';
import { EntriesIndexer } from './entries-indexer/indexer';
import { EntriesSaver } from './entries-saver/saver';
import { FilmlistEntrySource } from './entry-source/filmlist/filmlist-entry-source';
import { FilmlistManager } from './entry-source/filmlist/filmlist-manager';
import { FilmlistRepository, MediathekViewWebVerteilerFilmlistRepository } from './entry-source/filmlist/repository';
import { RedisLockProvider } from './lock/redis';
import { QueueProvider } from './queue';
import { RedisQueueProvider } from './queue/redis';
import { RedisProvider } from './redis/provider';
import { AggregatedEntryRepository, EntryRepository } from './repository';
import { MongoEntryRepository } from './repository/mongo/entry-repository';
import { NonWorkingAggregatedEntryRepository } from './repository/non-working-aggregated-entry-repository';
import { ElasticsearchSearchEngine } from './search-engine/elasticsearch';
import { Converter } from './search-engine/elasticsearch/converter';
import * as ConvertHandlers from './search-engine/elasticsearch/converter/handlers';
import { getElasticsearchLogAdapter } from './utils/elasticsearch-log-adapter-factory';
import { getMongoLogAdapter } from './utils/mongo-log-adapter-factory';

const MEDIATHEKVIEWWEB_VERTEILER_URL = 'https://verteiler.mediathekviewweb.de/';

const MONGO_CONNECTION_STRING = 'mongodb://localhost:27017';
const MONGO_CLIENT_OPTIONS: Mongo.MongoClientOptions = { appname: 'MediathekViewWeb', useNewUrlParser: true, autoReconnect: true, reconnectTries: Number.POSITIVE_INFINITY };
const MONGO_DATABASE_NAME = 'mediathekviewweb';
const MONGO_ENTRIES_COLLECTION_NAME = 'entries';

const ELASTICSEARCH_INDEX_NAME = 'mediathekviewweb';
const ELASTICSEARCH_TYPE_NAME = 'entry';
const ELASTICSEARCH_INDEX_SETTINGS = ElasticsearchSettings;
const ELASTICSEARCH_INDEX_MAPPING = ElasticsearchMapping;

const CORE_LOG = '[CORE]';
const FILMLIST_MANAGER_LOG = '[FILMLIST MANAGER]';
const QUEUE_LOG = '[QUEUE]';
const LOCK_LOG = '[LOCK]';
const DISTRIBUTED_LOOP_LOG = '[LOOP]';
const ENTRIES_IMPORTER_LOG = '[IMPORTER]';
const FILMLIST_ENTRY_SOURCE = '[FILMLIST SOURCE]';
const SEARCH_ENGINE_LOG = '[SEARCH ENGINE]';
const ENTRIES_INDEXER_LOG = '[INDEXER]';
const ENTRIES_SAVER_LOG = '[SAVER]';
const ELASTICSEARCH_LOG = '[ELASTICSEARCH]';
const REDIS_LOG = '[REDIS]';
const MONGO_LOG = '[MONGO]';

function getRedisProvider(providerFunction: (scope: string) => Redis): RedisProvider {
  return {
    get: providerFunction
  };
}

export class InstanceProvider {
  private static readonly instances: StringMap = {};
  private static readonly disposer: AsyncDisposer = new AsyncDisposer();
  private static readonly logger: Logger = new ConsoleLogger(LogLevel.Trace);

  private static async connectToDatabases(): Promise<void> {
    const logger = this.coreLogger();
    const redis = InstanceProvider.redis();
    const mongo = InstanceProvider.mongo();
    const elasticsearch = InstanceProvider.elasticsearch();

    await this.connect('redis', async () => await redis.connect() as Promise<void>, logger);
    await this.connect('mongo', async () => await mongo.connect(), logger);
    await this.connect('elasticsearch', async () => await elasticsearch.ping({ requestTimeout: 250 }) as Promise<void>, logger);
  }

  private static async connect(name: string, connectFunction: (() => Promise<any>), logger: Logger): Promise<void> {
    let success = false;
    while (!success && !this.disposer.disposing) {
      try {
        logger.info(`connecting to ${name}...`);
        await connectFunction();
        success = true;
        logger.info(`connected to ${name}`);
      }
      catch (error) {
        logger.verbose(`error connecting to ${name} (${(error as Error).message}), trying again...`);
        await timeout(1000);
      }
    }
  }

  private static newRedis(scope: string, lazyConnect: boolean): Redis {
    const logger = this.logger.prefix(`${REDIS_LOG} [${scope}] `);
    const redis = new RedisClient({
      lazyConnect,
      enableReadyCheck: true,
      maxRetriesPerRequest: undefined,
      ...config.redis
    });

    redis
      .on('connect', () => logger.verbose('connecting'))
      .on('ready', () => logger.verbose('ready'))
      .on('close', () => logger.verbose('connection closing'))
      .on('reconnecting', (milliseconds) => logger.verbose(`reconnecting in ${milliseconds} ms`))
      .on('end', () => logger.verbose('connection end'))
      .on('error', (error: Error) => logger.error(error, false));

    this.disposer.addDisposeTasks(async () => {
      const endPromise = new Promise<void>((resolve) => redis.once('end', resolve));

      await redis.quit();
      await endPromise;
    });

    return redis;
  }

  private static singleton<T>(type: any, builder: () => T): T {
    if (this.instances[type] == undefined) {
      this.instances[type] = builder();
    }

    return this.instances[type] as T;
  }

  static async initialize(): Promise<void> {
    await this.connectToDatabases();
  }

  static async disposeInstances(): Promise<void> {
    await this.disposer.dispose();
  }

  static mediathekViewWebApi(): MediathekViewWebApi {
    return this.singleton(MediathekViewWebApi, () => {
      const searchEngine = InstanceProvider.entrySearchEngine();
      return new MediathekViewWebApi(searchEngine);
    });
  }

  static mediathekViewWebRestApi(): MediathekViewWebRestApi {
    return this.singleton(MediathekViewWebRestApi, () => {
      const api = this.mediathekViewWebApi();
      const logger = this.logger.prefix('[REST] ');

      return new MediathekViewWebRestApi(api, logger);
    });
  }

  static entriesSaver(): EntriesSaver {
    return this.singleton(EntriesSaver, () => {
      const entryRepository = InstanceProvider.entryRepository();
      const queueProvider = InstanceProvider.queueProvider();
      const logger = this.logger.prefix(`${ENTRIES_SAVER_LOG} `);

      return new EntriesSaver(entryRepository, queueProvider, logger);
    });
  }

  static entriesIndexer(): EntriesIndexer {
    return this.singleton(EntriesIndexer, () => {
      const aggregatedEntryRepository = InstanceProvider.aggregatedEntryRepository();
      const searchEngine = InstanceProvider.entrySearchEngine();
      const queueProvider = InstanceProvider.queueProvider();
      const logger = this.logger.prefix(`${ENTRIES_INDEXER_LOG} `);

      return new EntriesIndexer(aggregatedEntryRepository, searchEngine, queueProvider, logger);
    });
  }

  static coreLogger(): Logger {
    return this.singleton('appLogger', () => {
      const logger = this.logger.prefix(`${CORE_LOG} `);
      return logger;
    });
  }

  static redisProvider(): RedisProvider {
    return this.singleton(getRedisProvider, () => getRedisProvider((scope) => this.newRedis(scope, false)));
  }

  static redis(): Redis {
    return this.singleton(RedisClient, () => this.newRedis('MAIN', true));
  }

  static elasticsearch(): ElasticsearchClient {
    return this.singleton(ElasticsearchClient, () => {
      const logger = this.logger.prefix(`${ELASTICSEARCH_LOG} `);
      const logAdapter = getElasticsearchLogAdapter(logger);

      const elasticsearchClient = new ElasticsearchClient({
        host: `${config.elasticsearch.host}:${config.elasticsearch.port}`,
        log: logAdapter
      });

      this.disposer.addDisposeTasks(() => elasticsearchClient.close());

      return elasticsearchClient;
    });
  }

  static mongo(): Mongo.MongoClient {
    return this.singleton(Mongo.MongoClient, () => {
      const logger = this.logger.prefix(`${MONGO_LOG} `);
      const logFunction = getMongoLogAdapter(logger);

      Mongo.Logger.setCurrentLogger(logFunction);

      const mongoClient: Mongo.MongoClient = new Mongo.MongoClient(MONGO_CONNECTION_STRING, MONGO_CLIENT_OPTIONS);

      mongoClient
        .on('fullsetup', () => logger.verbose('connection setup'))
        .on('reconnect', () => logger.warn('reconnected'))
        .on('timeout', () => logger.warn('connection timed out'))
        .on('close', () => logger.verbose('connection closed'));

      this.disposer.addDisposeTasks(async () => await mongoClient.close());

      return mongoClient;
    });
  }

  static database(): Mongo.Db {
    return this.singleton(Mongo.Db, () => {
      const mongo = this.mongo();
      return mongo.db(MONGO_DATABASE_NAME);
    });
  }

  static entriesCollection(): Mongo.Collection {
    return this.singleton('entriesCollection', () => {
      const database = this.database();
      return database.collection(MONGO_ENTRIES_COLLECTION_NAME);
    });
  }

  static datastoreFactory(): DatastoreFactory {
    return this.singleton(RedisDatastoreFactory, () => {
      const redis = this.redis();
      return new RedisDatastoreFactory(redis);
    });
  }

  static lockProvider(): LockProvider {
    return this.singleton(RedisLockProvider, () => {
      const redis = this.redis();
      const logger = this.logger.prefix(`${LOCK_LOG} `);

      return new RedisLockProvider(redis, logger);
    });
  }

  static filmlistRepository(): FilmlistRepository {
    return this.singleton(MediathekViewWebVerteilerFilmlistRepository, () => new MediathekViewWebVerteilerFilmlistRepository(MEDIATHEKVIEWWEB_VERTEILER_URL));
  }

  static distributedLoopProvider(): DistributedLoopProvider {
    return this.singleton(DistributedLoopProvider, () => {
      const lockProvider = this.lockProvider();
      const logger = this.logger.prefix(`${DISTRIBUTED_LOOP_LOG} `);

      return new DistributedLoopProvider(lockProvider, logger);
    });
  }

  static queueProvider(): QueueProvider {
    return this.singleton(RedisQueueProvider, () => {
      const redis = this.redis();
      const redisProvider = this.redisProvider();
      const lockProvider = this.lockProvider();
      const distributedLoopProvider = this.distributedLoopProvider();
      const queue = new RedisQueueProvider(redis, redisProvider, lockProvider, distributedLoopProvider, this.logger, QUEUE_LOG);

      return queue;
    });
  }

  static entriesImporter(): EntriesImporter {
    return this.singleton(EntriesImporter, () => {
      const queueProvider = this.queueProvider();
      const logger = this.logger.prefix(`${ENTRIES_IMPORTER_LOG} `);
      const source = InstanceProvider.filmlistEntrySource();

      return new EntriesImporter(queueProvider, logger, [source]);
    });
  }

  static entryRepository(): EntryRepository {
    return this.singleton(MongoEntryRepository, () => {
      const collection = this.entriesCollection();
      return new MongoEntryRepository(collection);
    });
  }

  static aggregatedEntryRepository(): AggregatedEntryRepository {
    return this.singleton(NonWorkingAggregatedEntryRepository, () => {
      const entryRepository = this.entryRepository();
      return new NonWorkingAggregatedEntryRepository(entryRepository);
    });
  }

  static entrySearchEngine(): SearchEngine<AggregatedEntry> {
    return this.singleton(ElasticsearchSearchEngine, () => {
      const elasticsearch = this.elasticsearch();
      const converter = this.elasticsearchConverter();
      const lockProvider = this.lockProvider();
      const logger = this.logger.prefix(`${SEARCH_ENGINE_LOG} `);

      const elasticsearchSearchEngine = new ElasticsearchSearchEngine<AggregatedEntry>(elasticsearch, converter, ELASTICSEARCH_INDEX_NAME, ELASTICSEARCH_TYPE_NAME, lockProvider, logger, ELASTICSEARCH_INDEX_SETTINGS, ELASTICSEARCH_INDEX_MAPPING);

      this.disposer.addDisposeTasks(async () => await elasticsearchSearchEngine.dispose());

      return elasticsearchSearchEngine;
    });
  }

  static elasticsearchConverter(): Converter {
    return this.singleton(Converter, () => {
      const keywordRewrites = new Set(textTypeFields);
      const sortConverter = new ConvertHandlers.SortConverter(keywordRewrites);
      const converter = new Converter(sortConverter);

      converter.registerHandler(
        new ConvertHandlers.TextQueryConvertHandler(),
        new ConvertHandlers.IDsQueryConvertHandler(),
        new ConvertHandlers.MatchAllQueryConvertHandler(),
        new ConvertHandlers.RegexQueryConvertHandler(),
        new ConvertHandlers.TermQueryConvertHandler(),
        new ConvertHandlers.BoolQueryConvertHandler(converter),
        new ConvertHandlers.RangeQueryConvertHandler()
      );

      return converter;
    });
  }

  static filmlistEntrySource(): FilmlistEntrySource {
    return this.singleton(FilmlistEntrySource, () => {
      const datastoreFactory = this.datastoreFactory();
      const queueProvider = this.queueProvider();
      const logger = this.logger.prefix(`${FILMLIST_ENTRY_SOURCE} `);

      return new FilmlistEntrySource(datastoreFactory, queueProvider, logger);
    });
  }

  static filmlistManager(): FilmlistManager {
    return this.singleton(FilmlistManager, () => {
      const datastoreFactory = this.datastoreFactory();
      const filmlistRepository = this.filmlistRepository();
      const distributedLoopProvider = this.distributedLoopProvider();
      const queueProvider = this.queueProvider();
      const logger = this.logger.prefix(`${FILMLIST_MANAGER_LOG} `);

      return new FilmlistManager(datastoreFactory, filmlistRepository, distributedLoopProvider, queueProvider, logger);
    });
  }
}
