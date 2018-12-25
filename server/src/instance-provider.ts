import { Client as ElasticsearchClient } from 'elasticsearch';
import * as RedisClient from 'ioredis';
import { Redis } from 'ioredis';
import * as Mongo from 'mongodb';
import { MediathekViewWebApi } from './api/api';
import { AsyncDisposer } from './common/disposable';
import { LockProvider } from './common/lock';
import { Logger, LoggerFactory } from './common/logger';
import { AggregatedEntry } from './common/model';
import { SearchEngine } from './common/search-engine';
import { config } from './config';
import { DatastoreFactory } from './datastore';
import { RedisDatastoreFactory } from './datastore/redis';
import { DistributedLoopProvider } from './distributed-loop';
import { ElasticsearchMapping, ElasticsearchSettings, TextTypeFields } from './elasticsearch-definitions';
import { EntriesImporter } from './entries-importer/importer';
import { EntriesIndexer } from './entries-indexer/indexer';
import { EntriesSaver } from './entries-saver/saver';
import { FilmlistEntrySource } from './entry-source/filmlist/filmlist-entry-source';
import { FilmlistManager } from './entry-source/filmlist/filmlist-manager';
import { FilmlistRepository, MediathekViewWebVerteilerFilmlistRepository } from './entry-source/filmlist/repository';
import { RedisLockProvider } from './lock/redis';
import { LoggerFactoryProvider } from './logger-factory-provider';
import { QueueProvider } from './queue';
import { RedisQueueProvider } from './queue/redis';
import { RedisProvider } from './redis/provider';
import { AggregatedEntryRepository, EntryRepository } from './repository';
import { MongoEntryRepository } from './repository/mongo/entry-repository';
import { NonWorkingAggregatedEntryRepository } from './repository/non-working-aggregated-entry-repository';
import { ElasticsearchSearchEngine } from './search-engine/elasticsearch';
import { Converter } from './search-engine/elasticsearch/converter';
import * as ConvertHandlers from './search-engine/elasticsearch/converter/handlers';
import { ElasticsearchLogAdapterFactory } from './utils/elasticsearch-log-adapter-factory';
import { MongoLogAdapterFactory } from './utils/mongo-log-adapter-factory';

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

class InstanceProviderRedisProvider implements RedisProvider {
  private readonly providerFunction: (scope: string) => Redis;

  constructor(providerFunction: (scope: string) => Redis) {
    this.providerFunction = providerFunction;
  }

  get(scope: string): Redis {
    return this.providerFunction(scope);
  }
}

export class InstanceProvider {
  private static instances: StringMap = {};
  private static loggerFactory: LoggerFactory = LoggerFactoryProvider.factory;
  private static disposer: AsyncDisposer = new AsyncDisposer();

  static async disposeInstances() {
    await this.disposer.dispose();
  }

  static mediathekViewWebApi(): MediathekViewWebApi {
    return this.singleton(MediathekViewWebApi, () => {
      const searchEngine = InstanceProvider.entrySearchEngine();
      return new MediathekViewWebApi(searchEngine);
    });
  }

  static entriesSaver(): EntriesSaver {
    return this.singleton(EntriesSaver, () => {
      const entryRepository = InstanceProvider.entryRepository();
      const queueProvider = InstanceProvider.queueProvider();
      const logger = LoggerFactoryProvider.factory.create(ENTRIES_SAVER_LOG);

      return new EntriesSaver(entryRepository, queueProvider, logger);
    });
  }

  static entriesIndexer(): EntriesIndexer {
    return this.singleton(EntriesIndexer, () => {
      const aggregatedEntryRepository = InstanceProvider.aggregatedEntryRepository();
      const searchEngine = InstanceProvider.entrySearchEngine();
      const queueProvider = InstanceProvider.queueProvider();
      const logger = LoggerFactoryProvider.factory.create(ENTRIES_INDEXER_LOG);

      return new EntriesIndexer(aggregatedEntryRepository, searchEngine, queueProvider, logger);
    });
  }

  static coreLogger(): Logger {
    return this.singleton('appLogger', () => this.loggerFactory.create(CORE_LOG));
  }

  static redisProvider(): RedisProvider {
    return this.singleton(InstanceProviderRedisProvider, () => new InstanceProviderRedisProvider((scope) => this.newRedis(scope, false)));
  }

  static redis(): Redis {
    return this.singleton(RedisClient, () => this.newRedis('MAIN', true));
  }

  private static newRedis(scope: string, lazyConnect: boolean): Redis {
    const logger = LoggerFactoryProvider.factory.create(`${REDIS_LOG} [${scope}]`);
    const redis = new RedisClient({
      lazyConnect: lazyConnect,
      enableReadyCheck: true,
      maxRetriesPerRequest: null,
      ...config.redis
    });

    redis
      .on('connect', () => logger.info('connected'))
      .on('ready', () => logger.info('ready'))
      .on('close', () => logger.warn('connection closed'))
      .on('reconnecting', (milliseconds) => logger.info(`reconnecting in ${milliseconds} ms`))
      .on('end', () => logger.warn(`connection end`))
      .on('error', (error: Error) => logger.error(error, false));

    this.disposer.addDisposeTasks(async () => await redis.quit());

    return redis;
  }

  static elasticsearch(): ElasticsearchClient {
    return this.singleton(ElasticsearchClient, () => {
      const logger = LoggerFactoryProvider.factory.create(ELASTICSEARCH_LOG);
      const logAdapter = ElasticsearchLogAdapterFactory.getLogAdapter(logger);

      const elasticsearchClient = new ElasticsearchClient({
        host: `${config.elasticsearch.host}:${config.elasticsearch.port}`,
        log: logAdapter
      });

      this.disposer.addDisposeTasks(async () => await elasticsearchClient.close());

      return elasticsearchClient;
    });
  }

  static mongo(): Mongo.MongoClient {
    return this.singleton(Mongo.MongoClient, () => {
      const logger = LoggerFactoryProvider.factory.create(MONGO_LOG);
      const logFunction = MongoLogAdapterFactory.getLogFunction(logger);

      Mongo.Logger.setCurrentLogger(logFunction);

      const mongoClient: Mongo.MongoClient = new Mongo.MongoClient(MONGO_CONNECTION_STRING, MONGO_CLIENT_OPTIONS);

      mongoClient
        .on('fullsetup', () => logger.info('connection setup'))
        .on('reconnect', () => logger.warn('reconnected'))
        .on('timeout', () => logger.warn('connection timed out'))
        .on('close', () => logger.warn('connection closed'));

      this.disposer.addDisposeTasks(async () => await mongoClient!.close());

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
      const logger = LoggerFactoryProvider.factory.create(LOCK_LOG);

      return new RedisLockProvider(redis, logger);
    });
  }

  static filmlistRepository(): FilmlistRepository {
    return this.singleton(MediathekViewWebVerteilerFilmlistRepository, () => new MediathekViewWebVerteilerFilmlistRepository(MEDIATHEKVIEWWEB_VERTEILER_URL));
  }

  static distributedLoopProvider(): DistributedLoopProvider {
    return this.singleton(DistributedLoopProvider, () => {
      const lockProvider = this.lockProvider();
      const logger = LoggerFactoryProvider.factory.create(DISTRIBUTED_LOOP_LOG);

      return new DistributedLoopProvider(lockProvider, logger);
    });
  }

  static queueProvider(): QueueProvider {
    return this.singleton(RedisQueueProvider, () => {
      const redis = this.redis();
      const redisProvider = this.redisProvider();
      const lockProvider = this.lockProvider();
      const distributedLoopProvider = this.distributedLoopProvider();
      const queue = new RedisQueueProvider(redis, redisProvider, lockProvider, distributedLoopProvider, this.loggerFactory, QUEUE_LOG);

      return queue;
    });
  }

  static entriesImporter(): EntriesImporter {
    return this.singleton(EntriesImporter, () => {
      const queueProvider = this.queueProvider();
      const logger = LoggerFactoryProvider.factory.create(ENTRIES_IMPORTER_LOG);

      return new EntriesImporter(queueProvider, logger);
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
      const logger = LoggerFactoryProvider.factory.create(SEARCH_ENGINE_LOG);

      const elasticsearchSearchEngine = new ElasticsearchSearchEngine<AggregatedEntry>(elasticsearch, converter, ELASTICSEARCH_INDEX_NAME, ELASTICSEARCH_TYPE_NAME, lockProvider, logger, ELASTICSEARCH_INDEX_SETTINGS, ELASTICSEARCH_INDEX_MAPPING);

      this.disposer.addSubDisposables(elasticsearchSearchEngine);

      return elasticsearchSearchEngine;
    });
  }

  static elasticsearchConverter(): Converter {
    return this.singleton(Converter, () => {
      const keywordRewrites = new Set(TextTypeFields);
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
      const logger = this.loggerFactory.create(FILMLIST_ENTRY_SOURCE);

      return new FilmlistEntrySource(datastoreFactory, queueProvider, logger);
    });
  }

  static filmlistManager(): FilmlistManager {
    return this.singleton(FilmlistManager, () => {
      const datastoreFactory = this.datastoreFactory();
      const filmlistRepository = this.filmlistRepository();
      const distributedLoopProvider = this.distributedLoopProvider();
      const queueProvider = this.queueProvider();
      const logger = this.loggerFactory.create(FILMLIST_MANAGER_LOG);

      return new FilmlistManager(datastoreFactory, filmlistRepository, distributedLoopProvider, queueProvider, logger);
    });
  }

  private static singleton<T>(type: any, builder: () => T): T {
    if (this.instances[type] == undefined) {
      this.instances[type] = builder();
    }

    return this.instances[type];
  }
}
