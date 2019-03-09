import { Client as ElasticsearchClient } from 'elasticsearch';
import * as RedisClient from 'ioredis';
import { Redis } from 'ioredis'; // tslint:disable-line: no-duplicate-imports
import * as Mongo from 'mongodb';
import { MediathekViewWebApi } from './api/api';
import { RestApi } from './api/rest-api';
import { AsyncDisposer } from './common/disposable';
import { LockProvider } from './common/lock';
import { Logger, LogLevel } from './common/logger';
import { ConsoleLogger } from './common/logger/console';
import { AggregatedEntry, Entry } from './common/model';
import { SearchEngine } from './common/search-engine';
import { StringMap } from './common/types';
import { timeout } from './common/utils';
import { config } from './config';
import { DatastoreFactory } from './datastore';
import { RedisDatastoreFactory } from './datastore/redis';
import { DistributedLoopProvider } from './distributed-loop';
import { elasticsearchMapping, elasticsearchSettings, textTypeFields } from './elasticsearch-definitions';
import { FilmlistEntrySource } from './entry-source/filmlist/filmlist-entry-source';
import { FilmlistRepository, MediathekViewWebVerteilerFilmlistRepository } from './entry-source/filmlist/repository';
import { RedisLockProvider } from './lock/redis';
import { FilmlistImport } from './model/filmlist-import';
import { QueueProvider } from './queue';
import { RedisQueueProvider } from './queue/redis';
import { RedisProvider } from './redis/provider';
import { AggregatedEntryRepository, EntryRepository } from './repository';
import { FilmlistImportRepository } from './repository/filmlists-import-repository';
import { MongoEntryRepository } from './repository/mongo/entry-repository';
import { MongoFilmlistImportRepository } from './repository/mongo/filmlist-import-repository';
import { MongoDocument } from './repository/mongo/mongo-document';
import { NonWorkingAggregatedEntryRepository } from './repository/non-working-aggregated-entry-repository';
import { ElasticsearchSearchEngine } from './search-engine/elasticsearch';
import { Converter } from './search-engine/elasticsearch/converter';
import * as ConvertHandlers from './search-engine/elasticsearch/converter/handlers';
import { ApiService } from './services/api';
import { EntriesImporterService } from './services/entries-importer';
import { EntriesIndexerService } from './services/entries-indexer';
import { EntriesSaverService } from './services/entries-saver';
import { FilmlistManagerService } from './services/filmlist-manager';
import { getElasticsearchLogAdapter } from './utils/elasticsearch-log-adapter-factory';
import { getMongoLogAdapter } from './utils/mongo-log-adapter-factory';

const MEDIATHEKVIEWWEB_VERTEILER_URL = 'https://verteiler.mediathekviewweb.de/';

const MONGO_CONNECTION_STRING = 'mongodb://localhost:27017';
const MONGO_CLIENT_OPTIONS: Mongo.MongoClientOptions = { appname: 'MediathekViewWeb', useNewUrlParser: true, autoReconnect: true, reconnectTries: Number.POSITIVE_INFINITY };
const MONGO_DATABASE_NAME = 'mediathekviewweb';
const MONGO_ENTRIES_COLLECTION_NAME = 'entries';
const FILMLIST_IMPORTS_COLLECTION_NAME = 'filmlistImports';

const ELASTICSEARCH_INDEX_NAME = 'mediathekviewweb';
const ELASTICSEARCH_TYPE_NAME = 'entry';
const ELASTICSEARCH_INDEX_SETTINGS = elasticsearchSettings;
const ELASTICSEARCH_INDEX_MAPPING = elasticsearchMapping;

const CORE_LOG = 'CORE';
const QUEUE_LOG = 'QUEUE';
const LOCK_LOG = 'LOCK';
const DISTRIBUTED_LOOP_LOG = 'LOOP';
const FILMLIST_ENTRY_SOURCE = 'FILMLIST SOURCE';
const SEARCH_ENGINE_LOG = 'SEARCH ENGINE';
const ELASTICSEARCH_LOG = 'ELASTICSEARCH';
const REDIS_LOG = 'REDIS';
const MONGO_LOG = 'MONGO';
const REST_API_LOG = 'REST API';

const FILMLIST_MANAGER_SERVICE_LOG = 'FILMLIST MANAGER';
const ENTRIES_IMPORTER_SERVICE_LOG = 'IMPORTER';
const ENTRIES_SAVER_SERVICE_LOG = 'SAVER';
const ENTRIES_INDEXER_SERVICE_LOG = 'INDEXER';
const API_SERVICE_LOG = 'API';

function getRedisProvider(providerFunction: (scope: string) => Promise<Redis>): RedisProvider {
  return {
    get: providerFunction
  };
}

export class InstanceProvider {
  private static readonly instances: StringMap = {};
  private static readonly disposer: AsyncDisposer = new AsyncDisposer();

  private static loggerInstance(): Logger {
    return this.singleton(ConsoleLogger, () => {
      const logger = new ConsoleLogger(config.verbosity);
      return logger;
    });
  }

  private static async connect(name: string, connectFunction: (() => Promise<any>), logger: Logger): Promise<void> {
    let success = false;
    while (!success && !this.disposer.disposing) {
      try {
        logger.verbose(`connecting to ${name}...`);
        await connectFunction();
        success = true;
        logger.info(`connected to ${name}`);
      }
      catch (error) {
        logger.verbose(`error connecting to ${name} (${(error as Error).message}), trying again...`);
        await timeout(2000);
      }
    }
  }

  private static async newRedis(scope: string): Promise<Redis> {
    const logger = this.logger(`[${REDIS_LOG}] [${scope}] `, false);

    const redis = new RedisClient({
      lazyConnect: true,
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

    await this.connect('redis', async () => await redis.connect() as Promise<void>, logger);

    return redis;
  }

  private static singleton<T>(type: any, builder: () => T): T {
    if (this.instances[type] == undefined) {
      this.instances[type] = builder();
    }

    return this.instances[type] as T;
  }

  static async disposeInstances(): Promise<void> {
    this.coreLogger().debug('dispose instances');
    await this.disposer.dispose();
  }

  static logger(prefix: string, autoBrackets: boolean = true): Logger {
    const formattedPrefix = autoBrackets ? `[${prefix}] ` : prefix;
    const logger = this.loggerInstance().prefix(formattedPrefix);

    return logger;
  }

  static async mediathekViewWebApi(): Promise<MediathekViewWebApi> {
    return this.singleton(MediathekViewWebApi, async () => {
      const searchEngine = await InstanceProvider.entrySearchEngine();
      return new MediathekViewWebApi(searchEngine);
    });
  }

  static async restApi(): Promise<RestApi> {
    return this.singleton(RestApi, async () => {
      const api = await this.mediathekViewWebApi();
      const logger = this.logger(REST_API_LOG);

      return new RestApi(api, logger);
    });
  }

  static async entriesSaverService(): Promise<EntriesSaverService> {
    return this.singleton(EntriesSaverService, async () => {
      const entryRepository = await InstanceProvider.entryRepository();
      const queueProvider = await InstanceProvider.queueProvider();
      const logger = this.logger(ENTRIES_SAVER_SERVICE_LOG);

      return new EntriesSaverService(entryRepository, queueProvider, logger);
    });
  }

  static async entriesIndexerService(): Promise<EntriesIndexerService> {
    return this.singleton(EntriesIndexerService, async () => {
      const aggregatedEntryRepository = await InstanceProvider.aggregatedEntryRepository();
      const searchEngine = await InstanceProvider.entrySearchEngine();
      const queueProvider = await InstanceProvider.queueProvider();
      const logger = this.logger(ENTRIES_INDEXER_SERVICE_LOG);

      return new EntriesIndexerService(aggregatedEntryRepository, searchEngine, queueProvider, logger);
    });
  }

  static async apiService(): Promise<ApiService> {
    return this.singleton(ApiService, async () => {
      const restApi = await this.restApi();
      const logger = this.logger(API_SERVICE_LOG);

      return new ApiService(restApi, logger);
    });
  }

  static coreLogger(): Logger {
    return this.singleton('coreLogger', () => {
      const logger = this.logger(CORE_LOG);
      return logger;
    });
  }

  static redisProvider(): RedisProvider {
    return this.singleton(getRedisProvider, () => getRedisProvider(async (scope) => this.newRedis(scope)));
  }

  static async redis(): Promise<Redis> {
    return this.singleton(RedisClient, async () => this.newRedis('MAIN'));
  }

  static async elasticsearch(): Promise<ElasticsearchClient> {
    return this.singleton(ElasticsearchClient, async () => {
      const logger = this.logger(ELASTICSEARCH_LOG);
      const logAdapter = getElasticsearchLogAdapter(logger);

      const elasticsearchClient = new ElasticsearchClient({
        host: `${config.elasticsearch.host}:${config.elasticsearch.port}`,
        log: logAdapter
      });

      this.disposer.addDisposeTasks(() => elasticsearchClient.close());

      await this.connect('elasticsearch', async () => await elasticsearchClient.ping({ requestTimeout: 500 }) as Promise<void>, logger);

      return elasticsearchClient;
    });
  }

  static async mongo(): Promise<Mongo.MongoClient> {
    return this.singleton(Mongo.MongoClient, async () => {
      const logger = this.logger(MONGO_LOG);
      const logFunction = getMongoLogAdapter(logger);

      Mongo.Logger.setCurrentLogger(logFunction);

      const mongoClient: Mongo.MongoClient = new Mongo.MongoClient(MONGO_CONNECTION_STRING, MONGO_CLIENT_OPTIONS);

      mongoClient
        .on('fullsetup', () => logger.verbose('connection setup'))
        .on('reconnect', () => logger.warn('reconnected'))
        .on('timeout', () => logger.warn('connection timed out'))
        .on('close', () => logger.verbose('connection closed'));

      this.disposer.addDisposeTasks(async () => await mongoClient.close());

      await this.connect('mongo', async () => await mongoClient.connect(), logger);

      return mongoClient;
    });
  }

  static async database(): Promise<Mongo.Db> {
    return this.singleton(Mongo.Db, async () => {
      const mongo = await this.mongo();
      return mongo.db(MONGO_DATABASE_NAME);
    });
  }

  static async entriesCollection(): Promise<Mongo.Collection<MongoDocument<Entry>>> {
    return this.collection(MONGO_ENTRIES_COLLECTION_NAME);
  }

  static async filmlistImportCollection(): Promise<Mongo.Collection<MongoDocument<FilmlistImport>>> {
    return this.collection(FILMLIST_IMPORTS_COLLECTION_NAME);
  }

  static async collection(name: string): Promise<Mongo.Collection> {
    return this.singleton(`mongo-collection-${name}`, async () => {
      const database = await this.database();
      return database.collection(name);
    });
  }

  static async datastoreFactory(): Promise<DatastoreFactory> {
    return this.singleton(RedisDatastoreFactory, async () => {
      const redis = await this.redis();
      return new RedisDatastoreFactory(redis);
    });
  }

  static async lockProvider(): Promise<LockProvider> {
    return this.singleton(RedisLockProvider, async () => {
      const redis = await this.redis();
      const logger = this.logger(LOCK_LOG);

      return new RedisLockProvider(redis, logger);
    });
  }

  static filmlistRepository(): FilmlistRepository {
    return this.singleton(MediathekViewWebVerteilerFilmlistRepository, () => new MediathekViewWebVerteilerFilmlistRepository(MEDIATHEKVIEWWEB_VERTEILER_URL));
  }

  static async distributedLoopProvider(): Promise<DistributedLoopProvider> {
    return this.singleton(DistributedLoopProvider, async () => {
      const lockProvider = await this.lockProvider();
      const logger = this.logger(DISTRIBUTED_LOOP_LOG);

      return new DistributedLoopProvider(lockProvider, logger);
    });
  }

  static async queueProvider(): Promise<QueueProvider> {
    return this.singleton(RedisQueueProvider, async () => {
      const redis = await this.redis();
      const redisProvider = this.redisProvider();
      const lockProvider = await this.lockProvider();
      const distributedLoopProvider = await this.distributedLoopProvider();
      const logger = this.logger(QUEUE_LOG);

      const queue = new RedisQueueProvider(redis, redisProvider, lockProvider, distributedLoopProvider, logger);
      return queue;
    });
  }

  static async entriesImporterService(): Promise<EntriesImporterService> {
    return this.singleton(EntriesImporterService, async () => {
      const queueProvider = await this.queueProvider();
      const logger = this.logger(ENTRIES_IMPORTER_SERVICE_LOG);
      const source = await InstanceProvider.filmlistEntrySource();

      return new EntriesImporterService(queueProvider, logger, [source]);
    });
  }

  static async entryRepository(): Promise<EntryRepository> {
    return this.singleton(MongoEntryRepository, async () => {
      const collection = await this.entriesCollection();
      const repository = new MongoEntryRepository(collection);

      await repository.initialize();

      return repository;
    });
  }

  static async filmlistImportRepository(): Promise<FilmlistImportRepository> {
    return this.singleton(MongoFilmlistImportRepository, async () => {
      const collection = await this.filmlistImportCollection();
      return new MongoFilmlistImportRepository(collection);
    });
  }

  static async aggregatedEntryRepository(): Promise<AggregatedEntryRepository> {
    return this.singleton(NonWorkingAggregatedEntryRepository, async () => {
      const entryRepository = await this.entryRepository();
      return new NonWorkingAggregatedEntryRepository(entryRepository);
    });
  }

  static async entrySearchEngine(): Promise<SearchEngine<AggregatedEntry>> {
    return this.singleton(ElasticsearchSearchEngine, async () => {
      const elasticsearch = await this.elasticsearch();
      const converter = this.elasticsearchConverter();
      const lockProvider = await this.lockProvider();
      const logger = this.logger(SEARCH_ENGINE_LOG);

      const elasticsearchSearchEngine = new ElasticsearchSearchEngine<AggregatedEntry>(elasticsearch, converter, ELASTICSEARCH_INDEX_NAME, ELASTICSEARCH_TYPE_NAME, lockProvider, logger, ELASTICSEARCH_INDEX_SETTINGS, ELASTICSEARCH_INDEX_MAPPING);

      this.disposer.addDisposeTasks(async () => await elasticsearchSearchEngine.dispose());

      await elasticsearchSearchEngine.initialize();

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
        new ConvertHandlers.IdsQueryConvertHandler(),
        new ConvertHandlers.MatchAllQueryConvertHandler(),
        new ConvertHandlers.RegexQueryConvertHandler(),
        new ConvertHandlers.TermQueryConvertHandler(),
        new ConvertHandlers.BoolQueryConvertHandler(converter),
        new ConvertHandlers.RangeQueryConvertHandler()
      );

      return converter;
    });
  }

  static async filmlistEntrySource(): Promise<FilmlistEntrySource> {
    return this.singleton(FilmlistEntrySource, async () => {
      const filmlistImportRepository = await this.filmlistImportRepository();
      const queueProvider = await this.queueProvider();
      const logger = this.logger(FILMLIST_ENTRY_SOURCE);

      return new FilmlistEntrySource(filmlistImportRepository, queueProvider, logger);
    });
  }

  static async filmlistManagerService(): Promise<FilmlistManagerService> {
    return this.singleton(FilmlistManagerService, async () => {
      const datastoreFactory = await this.datastoreFactory();
      const filmlistImportRepository = await this.filmlistImportRepository();
      const filmlistRepository = this.filmlistRepository();
      const distributedLoopProvider = await this.distributedLoopProvider();
      const queueProvider = await this.queueProvider();
      const logger = this.logger(FILMLIST_MANAGER_SERVICE_LOG);

      return new FilmlistManagerService(datastoreFactory, filmlistImportRepository, filmlistRepository, distributedLoopProvider, queueProvider, logger);
    });
  }
}
