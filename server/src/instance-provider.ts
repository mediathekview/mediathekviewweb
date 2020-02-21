import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
import { AsyncDisposer, disposeAsync } from '@tstdl/base/disposable';
import { LockProvider } from '@tstdl/base/lock';
import { Logger } from '@tstdl/base/logger';
import { ConsoleLogger } from '@tstdl/base/logger/console';
import { Queue } from '@tstdl/base/queue';
import { StringMap } from '@tstdl/base/types';
import { singleton, timeout } from '@tstdl/base/utils';
import { MongoDocument } from '@tstdl/mongo';
import { MongoLockProvider, MongoLockRepository } from '@tstdl/mongo/lock';
import { MongoQueue } from '@tstdl/mongo/queue';
import { HttpApi } from '@tstdl/server/api/http-api';
import { DistributedLoopProvider } from '@tstdl/server/distributed-loop';
import * as Mongo from 'mongodb';
import { mongoNames } from './collections';
import { AggregatedEntry, Entry } from './common/models';
import { SearchEngine } from './common/search-engine';
import { config } from './config';
import { AggregatedEntryDataSource } from './data-sources/aggregated-entry.data-source';
import { NonWorkingAggregatedEntryDataSource } from './data-sources/non-working-aggregated-entry.data-source';
import { elasticsearchMapping, elasticsearchSettings, textTypeFields } from './elasticsearch-definitions';
import { FilmlistProvider } from './entry-source/filmlist';
import { FilmlistEntrySource } from './entry-source/filmlist/filmlist-entry-source';
import { FilmlistResourceTimestampStrategy, S3FilmlistProvider, S3FilmlistProviderOptions } from './entry-source/filmlist/providers';
import { FilmlistImportQueueItem } from './models';
import { FilmlistImport } from './models/filmlist-import';
import { ApiModule } from './modules/api';
import { EntriesImporterModule } from './modules/entries-importer';
import { EntriesIndexerModule } from './modules/entries-indexer';
import { FilmlistManagerModule } from './modules/filmlist-manager';
import { EntryRepository } from './repositories';
import { FilmlistImportRepository } from './repositories/filmlist-import-repository';
import { KeyValueRepository } from './repositories/key-value-repository';
import { MongoEntryRepository } from './repositories/mongo/entry-repository';
import { MongoFilmlistImportRepository } from './repositories/mongo/filmlist-import-repository';
import { MongoKeyValueRepository } from './repositories/mongo/key-value-repository';
import { ElasticsearchSearchEngine } from './search-engine/elasticsearch';
import { Converter } from './search-engine/elasticsearch/converter';
import * as ConvertHandlers from './search-engine/elasticsearch/converter/handlers';
import { getElasticsearchLogAdapter } from './utils/elasticsearch-log-adapter-factory';
import { getMongoLogAdapter } from './utils/mongo-log-adapter-factory';

const MVW_VERTEILER_FILMLIST_PROVIDER_INSTANCE_NAME = 'mvw-verteiler';
const MVW_VERTEILER_S3_URL = 'https://s3.mediathekviewweb.de';

const MONGO_CONNECTION_STRING = 'mongodb://localhost:27017';
const MONGO_CLIENT_OPTIONS: Mongo.MongoClientOptions = {
  appname: 'MediathekViewWeb',
  useUnifiedTopology: true,
  useNewUrlParser: true
};

const ELASTICSEARCH_INDEX_NAME = 'mediathekviewweb';
const ELASTICSEARCH_TYPE_NAME = 'entry';
const ELASTICSEARCH_INDEX_SETTINGS = elasticsearchSettings;
const ELASTICSEARCH_INDEX_MAPPING = elasticsearchMapping;

const CORE_LOG = 'CORE';
const QUEUE_LOG = 'QUEUE';
const LOCK_LOG = 'LOCK';
const FILMLIST_ENTRY_SOURCE = 'FILMLIST SOURCE';
const SEARCH_ENGINE_LOG = 'SEARCH ENGINE';
const ELASTICSEARCH_LOG = 'ELASTICSEARCH';
const REDIS_LOG = 'REDIS';
const MONGO_LOG = 'MONGO';
const HTTP_API_LOG = 'REST API';

const FILMLIST_MANAGER_MODULE_LOG = 'FILMLIST MANAGER';
const ENTRIES_IMPORTER_MODULE_LOG = 'IMPORTER';
const ENTRIES_SAVER_MODULE_LOG = 'SAVER';
const ENTRIES_INDEXER_MODULE_LOG = 'INDEXER';
const API_MODULE_LOG = 'API';

export class InstanceProvider {
  private static readonly disposer: AsyncDisposer = new AsyncDisposer();

  private static loggerInstance(): Logger {
    return singleton(ConsoleLogger, () => {
      const logger = new ConsoleLogger(config.verbosity);
      return logger;
    });
  }

  private static async connect(name: string, connectFunction: (() => Promise<any>), logger: Logger): Promise<void> {
    let success = false;
    while (!success && !InstanceProvider.disposer.disposing) {
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

  static async disposeInstances(): Promise<void> {
    InstanceProvider.coreLogger().debug('dispose instances');
    await InstanceProvider.disposer[disposeAsync]();
  }

  static logger(prefix: string, autoBrackets: boolean = true): Logger {
    const formattedPrefix = autoBrackets ? `[${prefix}] ` : prefix;
    const logger = InstanceProvider.loggerInstance().prefix(formattedPrefix);

    return logger;
  }

  static async entriesIndexerModule(): Promise<EntriesIndexerModule> {
    return singleton(EntriesIndexerModule, async () => {
      const aggregatedEntryDataSource = await InstanceProvider.aggregatedEntryDataSource();
      const searchEngine = await InstanceProvider.entrySearchEngine();
      const entryRepository = await InstanceProvider.entryRepository();
      const logger = InstanceProvider.logger(ENTRIES_INDEXER_MODULE_LOG);

      return new EntriesIndexerModule(entryRepository, aggregatedEntryDataSource, searchEngine, logger);
    });
  }

  static async keyValueRepository(): Promise<KeyValueRepository<StringMap>> {
    return singleton(MongoKeyValueRepository, async () => {
      const collection = await InstanceProvider.mongoCollection(mongoNames.KeyValues);
      return new MongoKeyValueRepository(collection);
    });
  }

  static async filmlistImportQueue(): Promise<Queue<FilmlistImportQueueItem>> {
    return singleton(mongoNames.FilmlistImportQueue, () => InstanceProvider.mongoQueue<FilmlistImportQueueItem>(mongoNames.FilmlistImportQueue, 10 * 60 * 1000, 3));
  }

  static async apiModule(): Promise<ApiModule> {
    return singleton(ApiModule, async () => {
      const restApi = await InstanceProvider.httpApi();
      const logger = InstanceProvider.logger(API_MODULE_LOG);

      return new ApiModule(restApi, logger);
    });
  }

  static async httpApi(): Promise<HttpApi> {
    return singleton(HttpApi, async () => {
      const logger = InstanceProvider.logger(HTTP_API_LOG);

      return new HttpApi({ prefix: '/api', logger, behindProxy: true });
    });
  }

  static coreLogger(): Logger {
    return singleton('coreLogger', () => {
      const logger = InstanceProvider.logger(CORE_LOG);
      return logger;
    });
  }

  static async elasticsearch(): Promise<ElasticsearchClient> {
    return singleton(ElasticsearchClient, async () => {
      const logger = InstanceProvider.logger(ELASTICSEARCH_LOG);
      const logAdapter = getElasticsearchLogAdapter(logger);

      const elasticsearchClient = new ElasticsearchClient({
        node: config.elasticsearch.url,
      });

      InstanceProvider.disposer.add(async () => elasticsearchClient.close());

      await InstanceProvider.connect('elasticsearch', async () => await elasticsearchClient.ping(), logger);

      return elasticsearchClient;
    });
  }

  static async mongo(): Promise<Mongo.MongoClient> {
    return singleton(Mongo.MongoClient, async () => {
      const logger = InstanceProvider.logger(MONGO_LOG);
      const logFunction = getMongoLogAdapter(logger);

      Mongo.Logger.setCurrentLogger(logFunction);

      const mongoClient: Mongo.MongoClient = new Mongo.MongoClient(MONGO_CONNECTION_STRING, MONGO_CLIENT_OPTIONS);

      mongoClient
        .on('fullsetup', () => logger.verbose('connection setup'))
        .on('reconnect', () => logger.warn('reconnected'))
        .on('timeout', () => logger.warn('connection timed out'))
        .on('close', () => logger.verbose('connection closed'));

      InstanceProvider.disposer.add(async () => await mongoClient.close());

      await InstanceProvider.connect('mongo', async () => await mongoClient.connect(), logger);

      return mongoClient;
    });
  }

  static async database(): Promise<Mongo.Db> {
    return singleton(Mongo.Db, async () => {
      const mongo = await InstanceProvider.mongo();
      return mongo.db(mongoNames.Database);
    });
  }

  static async entriesCollection(): Promise<Mongo.Collection<MongoDocument<Entry>>> {
    return InstanceProvider.mongoCollection(mongoNames.Entries);
  }

  static async filmlistImportCollection(): Promise<Mongo.Collection<MongoDocument<FilmlistImport>>> {
    return InstanceProvider.mongoCollection(mongoNames.FilmlistImports);
  }

  static async mongoCollection(name: string): Promise<Mongo.Collection> {
    return singleton(`mongo-collection-${name}`, async () => {
      const database = await InstanceProvider.database();
      return database.collection(name);
    });
  }

  static async mongoLockRepository(): Promise<MongoLockRepository> {
    return singleton(MongoLockRepository, async () => {
      const collection = await InstanceProvider.mongoCollection(mongoNames.Locks);
      const repository = new MongoLockRepository(collection);
      await repository.initialize();

      return repository;
    });
  }

  static async lockProvider(): Promise<LockProvider> {
    return singleton(MongoLockProvider, async () => {
      const repository = await InstanceProvider.mongoLockRepository();
      const logger = InstanceProvider.logger('LOCK');

      return new MongoLockProvider(repository, logger);
    });
  }

  static filmlistProvider(): FilmlistProvider {
    const options: S3FilmlistProviderOptions = {
      url: MVW_VERTEILER_S3_URL,
      accessKey: '',
      secretKey: '',
      latest: { bucket: 'verteiler', object: 'Filmliste-akt.xz' },
      archive: { bucket: 'verteiler-archiv', timestampStrategy: FilmlistResourceTimestampStrategy.FileName }
    };

    return singleton(S3FilmlistProvider, () => new S3FilmlistProvider(MVW_VERTEILER_FILMLIST_PROVIDER_INSTANCE_NAME, options));
  }

  static async distributedLoopProvider(): Promise<DistributedLoopProvider> {
    return singleton(DistributedLoopProvider, async () => {
      const lockProvider = await InstanceProvider.lockProvider();
      return new DistributedLoopProvider(lockProvider);
    });
  }

  static async mongoQueue<T>(collectionName: string, processTimeout: number, maxTries: number): Promise<MongoQueue<T>> {
    const key = `mongo-queue:${collectionName}`;

    return singleton(key, async () => {
      const collection = await InstanceProvider.mongoCollection(collectionName);
      const queue = new MongoQueue<T>(collection, processTimeout, maxTries);

      return queue;
    });
  }

  static async entriesImporterModule(): Promise<EntriesImporterModule> {
    return singleton(EntriesImporterModule, async () => {
      const entryRepository = await InstanceProvider.entryRepository();
      const logger = InstanceProvider.logger(ENTRIES_IMPORTER_MODULE_LOG);
      const source = await InstanceProvider.filmlistEntrySource();

      return new EntriesImporterModule(entryRepository, logger, [source]);
    });
  }

  static async entryRepository(): Promise<EntryRepository> {
    return singleton(MongoEntryRepository, async () => {
      const collection = await InstanceProvider.entriesCollection();
      const repository = new MongoEntryRepository(collection);

      await repository.initialize();
      return repository;
    });
  }

  static async filmlistImportRepository(): Promise<FilmlistImportRepository> {
    return singleton(MongoFilmlistImportRepository, async () => {
      const collection = await InstanceProvider.filmlistImportCollection();
      return new MongoFilmlistImportRepository(collection);
    });
  }

  static async aggregatedEntryDataSource(): Promise<AggregatedEntryDataSource> {
    return singleton(NonWorkingAggregatedEntryDataSource, async () => new NonWorkingAggregatedEntryDataSource());
  }

  static async entrySearchEngine(): Promise<SearchEngine<AggregatedEntry>> {
    return singleton(ElasticsearchSearchEngine, async () => {
      const elasticsearch = await InstanceProvider.elasticsearch();
      const converter = InstanceProvider.elasticsearchConverter();
      const lockProvider = await InstanceProvider.lockProvider();
      const logger = InstanceProvider.logger(SEARCH_ENGINE_LOG);

      const elasticsearchSearchEngine = new ElasticsearchSearchEngine<AggregatedEntry>(elasticsearch, converter, ELASTICSEARCH_INDEX_NAME, lockProvider, logger, ELASTICSEARCH_INDEX_SETTINGS, ELASTICSEARCH_INDEX_MAPPING);

      InstanceProvider.disposer.add(async () => await elasticsearchSearchEngine[disposeAsync]());

      await elasticsearchSearchEngine.initialize();

      return elasticsearchSearchEngine;
    });
  }

  static elasticsearchConverter(): Converter {
    return singleton(Converter, () => {
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
    return singleton(FilmlistEntrySource, async () => {
      const filmlistProvider = InstanceProvider.filmlistProvider();
      const filmlistImportRepository = await InstanceProvider.filmlistImportRepository();
      const importQueue = await InstanceProvider.filmlistImportQueue();
      const lockProvider = await InstanceProvider.lockProvider();
      const logger = InstanceProvider.logger(FILMLIST_ENTRY_SOURCE);

      return new FilmlistEntrySource(filmlistProvider, filmlistImportRepository, importQueue, lockProvider, logger);
    });
  }

  static async filmlistManagerModule(): Promise<FilmlistManagerModule> {
    return singleton(FilmlistManagerModule, async () => {
      const keyValueRepository = await InstanceProvider.keyValueRepository();
      const filmlistImportRepository = await InstanceProvider.filmlistImportRepository();
      const filmlistImportQueue = await InstanceProvider.filmlistImportQueue();
      const filmlistProvider = InstanceProvider.filmlistProvider();
      const distributedLoopProvider = await InstanceProvider.distributedLoopProvider();
      const logger = InstanceProvider.logger(FILMLIST_MANAGER_MODULE_LOG);

      return new FilmlistManagerModule(keyValueRepository, filmlistImportRepository, filmlistImportQueue, filmlistProvider, distributedLoopProvider, logger);
    });
  }
}
