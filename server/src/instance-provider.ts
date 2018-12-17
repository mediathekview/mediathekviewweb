import { Client as ElasticsearchClient } from 'elasticsearch';
import * as Redis from 'ioredis';
import * as Mongo from 'mongodb';
import { MediathekViewWebApi } from './api/api';
import { MediathekViewWebRestApi } from './api/rest-api';
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
import { AggregatedEntryRepository, EntryRepository } from './repository';
import { MongoEntryRepository } from './repository/mongo/entry-repository';
import { NonWorkingAggregatedEntryRepository } from './repository/non-working-aggregated-entry-repository';
import { ElasticsearchSearchEngine } from './search-engine/elasticsearch';
import { Converter } from './search-engine/elasticsearch/converter';
import * as ConvertHandlers from './search-engine/elasticsearch/converter/handlers';
import { ElasticsearchLogAdapterFactory } from './utils/elasticsearch-log-adapter-factory';
import { MongoLogAdapterFactory } from './utils/mongo-log-adapter-factory';
import { RedisProvider } from './redis/provider';

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
const ENTRIES_IMPORTER_LOG = '[IMPORTER]';
const FILMLIST_ENTRY_SOURCE = '[FILMLIST SOURCE]';
const SEARCH_ENGINE_LOG = '[SEARCH ENGINE]';
const ENTRIES_INDEXER_LOG = '[INDEXER]';
const ENTRIES_SAVER_LOG = '[SAVER]';
const ELASTICSEARCH_LOG = '[ELASTICSEARCH]';
const REDIS_LOG = '[REDIS]';
const MONGO_LOG = '[MONGO]';

class InstanceProviderRedisProvider implements RedisProvider {
  private readonly providerFunction: (scope: string) => Promise<Redis.Redis>;

  constructor(providerFunction: (scope: string) => Promise<Redis.Redis>) {
    this.providerFunction = providerFunction;
  }

  async get(scope: string): Promise<Redis.Redis> {
    return await this.providerFunction(scope);
  }
}

export class InstanceProvider {
  private static instances: StringMap = {};
  private static loggerFactory: LoggerFactory = LoggerFactoryProvider.factory;

  static mediathekViewWebApi(): Promise<MediathekViewWebApi> {
    return this.singleton(MediathekViewWebApi, async () => {
      const searchEngine = await InstanceProvider.entrySearchEngine();

      return new MediathekViewWebApi(searchEngine);
    });
  }

  static mediathekViewWebRestApi(): Promise<MediathekViewWebRestApi> {
    return this.singleton(MediathekViewWebRestApi, async () => {
      const api = await InstanceProvider.mediathekViewWebApi();

      return new MediathekViewWebRestApi(api);
    });
  }

  static entriesSaver(): Promise<EntriesSaver> {
    return this.singleton(EntriesSaver, async () => {
      const entryRepository = await InstanceProvider.entryRepository();
      const datastoreFactory = await InstanceProvider.datastoreFactory();
      const logger = LoggerFactoryProvider.factory.create(ENTRIES_SAVER_LOG);

      return new EntriesSaver(entryRepository, datastoreFactory, logger);
    });
  }

  static entriesIndexer(): Promise<EntriesIndexer> {
    return this.singleton(EntriesIndexer, async () => {
      const aggregatedEntryRepository = await InstanceProvider.aggregatedEntryRepository();
      const searchEngine = await InstanceProvider.entrySearchEngine();
      const datastoreFactory = await InstanceProvider.datastoreFactory();
      const logger = LoggerFactoryProvider.factory.create(ENTRIES_INDEXER_LOG);

      return new EntriesIndexer(aggregatedEntryRepository, searchEngine, datastoreFactory, logger);
    });
  }

  static coreLogger(): Promise<Logger> {
    return this.singleton('appLogger', () => this.loggerFactory.create(CORE_LOG));
  }

  static redisProvider(): Promise<RedisProvider> {
    return this.singleton(InstanceProviderRedisProvider, () => new InstanceProviderRedisProvider((scope) => this.newRedis(scope)));
  }

  static redis(): Promise<Redis.Redis> {
    return this.singleton(Redis, async () => this.newRedis('MAIN'));
  }

  private static async newRedis(scope: string): Promise<Redis.Redis> {
    const logger = LoggerFactoryProvider.factory.create(`${REDIS_LOG} [${scope}]`);
    const redis = new Redis({
      lazyConnect: true,
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

    await redis.connect();

    return redis;
  }

  static elasticsearch(): Promise<ElasticsearchClient> {
    return this.singleton(ElasticsearchClient, () => {
      const logger = LoggerFactoryProvider.factory.create(ELASTICSEARCH_LOG);
      const logAdapter = ElasticsearchLogAdapterFactory.getLogAdapter(logger);

      const elasticsearchClient = new ElasticsearchClient({
        log: logAdapter
      });

      return elasticsearchClient;
    });
  }

  static mongo(): Promise<Mongo.MongoClient> {
    return this.singleton(Mongo.MongoClient, async () => {
      const logger = LoggerFactoryProvider.factory.create(MONGO_LOG);
      const logFunction = MongoLogAdapterFactory.getLogFunction(logger);

      let mongoClient: Mongo.MongoClient | null = null;

      do {
        mongoClient = await Mongo.MongoClient.connect(MONGO_CONNECTION_STRING, MONGO_CLIENT_OPTIONS);
        logger.info('connected');

        mongoClient
          .on('fullsetup', () => logger.info('connection setup'))
          .on('reconnect', () => logger.warn('reconnected'))
          .on('timeout', () => logger.warn('connection timed out'))
          .on('close', () => logger.warn('connection closed'));

      } while (mongoClient == null);

      Mongo.Logger.setCurrentLogger(logFunction);

      return mongoClient;
    });
  }

  static database(): Promise<Mongo.Db> {
    return this.singleton(Mongo.Db, async () => {
      const mongo = await this.mongo();
      return mongo.db(MONGO_DATABASE_NAME);
    });
  }

  static entriesCollection(): Promise<Mongo.Collection> {
    return this.singleton('entriesCollection', async () => {
      const database = await this.database();
      return database.collection(MONGO_ENTRIES_COLLECTION_NAME);
    });
  }

  static datastoreFactory(): Promise<DatastoreFactory> {
    return this.singleton(RedisDatastoreFactory, async () => {
      const redis = await this.redis();
      return new RedisDatastoreFactory(redis);
    });
  }

  static lockProvider(): Promise<LockProvider> {
    return this.singleton(RedisLockProvider, async () => {
      const redis = await this.redis();
      const logger = LoggerFactoryProvider.factory.create(LOCK_LOG);

      return new RedisLockProvider(redis, logger);
    });
  }

  static filmlistRepository(): Promise<FilmlistRepository> {
    return this.singleton(MediathekViewWebVerteilerFilmlistRepository, () => new MediathekViewWebVerteilerFilmlistRepository(MEDIATHEKVIEWWEB_VERTEILER_URL));
  }

  static distributedLoopProvider(): Promise<DistributedLoopProvider> {
    return this.singleton(DistributedLoopProvider, async () => {
      const lockProvider = await this.lockProvider();
      return new DistributedLoopProvider(lockProvider);
    });
  }

  static queueProvider(): Promise<QueueProvider> {
    return this.singleton(RedisQueueProvider, async () => {
      const redis = await this.redis();
      const redisProvider = await this.redisProvider();
      const lockProvider = await this.lockProvider();
      const distributedLoopProvider = await this.distributedLoopProvider();
      const queue = new RedisQueueProvider(redis, redisProvider, lockProvider, distributedLoopProvider, this.loggerFactory, QUEUE_LOG);

      return queue;
    });
  }

  static entriesImporter(): Promise<EntriesImporter> {
    return this.singleton(EntriesImporter, async () => {
      const queueProvider = await this.queueProvider();
      const logger = LoggerFactoryProvider.factory.create(ENTRIES_IMPORTER_LOG);

      return new EntriesImporter(queueProvider, logger);
    });
  }

  static entryRepository(): Promise<EntryRepository> {
    return this.singleton(MongoEntryRepository, async () => {
      const collection = await this.entriesCollection();
      return new MongoEntryRepository(collection);
    });
  }

  static aggregatedEntryRepository(): Promise<AggregatedEntryRepository> {
    return this.singleton(NonWorkingAggregatedEntryRepository, async () => {
      const entryRepository = await this.entryRepository();
      return new NonWorkingAggregatedEntryRepository(entryRepository);
    });
  }

  static entrySearchEngine(): Promise<SearchEngine<AggregatedEntry>> {
    return this.singleton(ElasticsearchSearchEngine, async () => {
      const elasticsearch = await this.elasticsearch();
      const converter = await this.elasticsearchConverter();
      const logger = LoggerFactoryProvider.factory.create(SEARCH_ENGINE_LOG);

      const elasticsearchSearchEngine = new ElasticsearchSearchEngine<AggregatedEntry>(elasticsearch, converter, ELASTICSEARCH_INDEX_NAME, ELASTICSEARCH_TYPE_NAME, logger, ELASTICSEARCH_INDEX_SETTINGS, ELASTICSEARCH_INDEX_MAPPING);
      await elasticsearchSearchEngine.initialize();

      return elasticsearchSearchEngine;
    });
  }

  static elasticsearchConverter(): Promise<Converter> {
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

  static filmlistEntrySource(): Promise<FilmlistEntrySource> {
    return this.singleton(FilmlistEntrySource, async () => {
      const datastoreFactory = await this.datastoreFactory();
      const queueProvider = await this.queueProvider();
      const logger = this.loggerFactory.create(FILMLIST_ENTRY_SOURCE);

      return new FilmlistEntrySource(datastoreFactory, queueProvider, logger);
    });
  }

  static filmlistManager(): Promise<FilmlistManager> {
    return this.singleton(FilmlistManager, async () => {
      const datastoreFactory = await this.datastoreFactory();
      const filmlistRepository = await this.filmlistRepository();
      const distributedLoopProvider = await this.distributedLoopProvider();
      const queueProvider = await this.queueProvider();
      const logger = this.loggerFactory.create(FILMLIST_MANAGER_LOG);

      return new FilmlistManager(datastoreFactory, filmlistRepository, distributedLoopProvider, queueProvider, logger);
    });
  }

  private static async singleton<T>(type: any, builder: () => T | Promise<T>): Promise<T> {
    if (this.instances[type] == undefined) {
      this.instances[type] = builder();
    }

    return this.instances[type];
  }
}
