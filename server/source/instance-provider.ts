import { EntriesImporterModule, EntriesIndexerModule, FilmlistManagerKeyValues, FilmlistManagerModule } from '$root/modules';
import type { AggregatedEntry, Entry } from '$shared/models/core';
import type { FilmlistImportJobData, FilmlistImportRecord } from '$shared/models/filmlist';
import type { SearchEngine } from '$shared/search-engine';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
import { disposeAsync } from '@tstdl/base/disposable';
import { configureBaseInstanceProvider, disposer, getKeyValueStore, getLockProvider, getLogger } from '@tstdl/base/instance-provider';
import { LogLevel } from '@tstdl/base/logger';
import type { Queue } from '@tstdl/base/queue';
import { singleton } from '@tstdl/base/utils';
import type { Collection } from '@tstdl/mongo';
import { configureMongoInstanceProvider, getMongoCollection, getMongoLockProvider, getMongoMigrationStateRepository, getMongoQueue, getMongoRepository } from '@tstdl/mongo/instance-provider';
import { DistributedLoopProvider } from '@tstdl/server/distributed-loop';
import { configureServerInstanceProvider, connect } from '@tstdl/server/instance-provider';
import type * as Mongo from 'mongodb';
import { config } from './config';
import type { AggregatedEntryDataSource } from './data-sources/aggregated-entry.data-source';
import { NonWorkingAggregatedEntryDataSource } from './data-sources/non-working-aggregated-entry.data-source';
import { elasticsearchMapping, elasticsearchSettings, textTypeFields } from './elasticsearch-definitions';
import type { FilmlistProvider } from './entry-source/filmlist';
import { FilmlistEntrySource } from './entry-source/filmlist/filmlist-entry-source';
import type { S3FilmlistProviderOptions } from './entry-source/filmlist/providers';
import { FilmlistResourceTimestampStrategy, S3FilmlistProvider } from './entry-source/filmlist/providers';
import { mongoQueues, mongoRepositories } from './mongo-configs';
import type { EntryRepository, FilmlistImportRepository } from './repositories';
import { MongoEntryRepository } from './repositories/mongo/entry.repository';
import { MongoFilmlistImportRepository } from './repositories/mongo/filmlist-import.repository';
import { ElasticsearchSearchEngine } from './search-engine/elasticsearch';
import { Converter } from './search-engine/elasticsearch/converter';
import * as ConvertHandlers from './search-engine/elasticsearch/converter/handlers';

const MVW_VERTEILER_FILMLIST_PROVIDER_INSTANCE_NAME = 'mvw-verteiler';
const MVW_VERTEILER_S3_URL = 'https://s3.mediathekviewweb.de';

const MONGO_CONNECTION_STRING = 'mongodb://localhost:27017';
const MONGO_CLIENT_OPTIONS: Mongo.MongoClientOptions = {
  appname: 'MediathekViewWeb',
  useUnifiedTopology: true,
  useNewUrlParser: true
};

const ELASTICSEARCH_INDEX_NAME = 'mediathekviewweb';
const ELASTICSEARCH_INDEX_SETTINGS = elasticsearchSettings;
const ELASTICSEARCH_INDEX_MAPPING = elasticsearchMapping;

const FILMLIST_ENTRY_SOURCE = 'FILMLIST SOURCE';
const SEARCH_ENGINE_LOG = 'SEARCH ENGINE';
const ELASTICSEARCH_LOG = 'ELASTICSEARCH';

const FILMLIST_MANAGER_MODULE_LOG = 'FILMLIST MANAGER';
const ENTRIES_IMPORTER_MODULE_LOG = 'IMPORTER';
const ENTRIES_INDEXER_MODULE_LOG = 'INDEXER';

const filmlistManagerKeyValueStoreScope = 'filmlist-manager';

configureBaseInstanceProvider({
  logLevel: LogLevel.Trace,
  lockProviderProvider: getMongoLockProvider
});

configureServerInstanceProvider({
  httpApiUrlPrefix: '/api',
  httpApiBehindProxy: true,
  migrationStateRepositoryProvider: getMongoMigrationStateRepository
});

configureMongoInstanceProvider({
  connectionString: MONGO_CONNECTION_STRING,
  defaultDatabase: 'mediathekviewweb',
  clientOptions: MONGO_CLIENT_OPTIONS,
  mongoLockRepositoryConfig: mongoRepositories.locks,
  mongoMigrationStateRepositoryConfig: mongoRepositories.migrationStates,
  mongoKeyValueRepositoryConfig: mongoRepositories.keyValues
});

async function getEntriesIndexerModule(): Promise<EntriesIndexerModule> {
  return singleton(EntriesIndexerModule, async () => {
    const aggregatedEntryDataSource = getAggregatedEntryDataSource();
    const searchEngine = await getEntrySearchEngine();
    const entryRepository = await getEntryRepository();
    const logger = getLogger(ENTRIES_INDEXER_MODULE_LOG);

    return new EntriesIndexerModule(entryRepository, aggregatedEntryDataSource, searchEngine, logger);
  });
}

async function getFilmlistImportQueue(): Promise<Queue<FilmlistImportJobData>> {
  return getMongoQueue(mongoQueues.filmlistImportQueue);
}

async function getElasticsearch(): Promise<ElasticsearchClient> {
  return singleton(ElasticsearchClient, async () => {
    const logger = getLogger(ELASTICSEARCH_LOG);

    const elasticsearchClient = new ElasticsearchClient({
      node: config.elasticsearch.url
    });

    disposer.add(async () => elasticsearchClient.close());

    await connect('elasticsearch', async () => elasticsearchClient.ping(), logger);

    return elasticsearchClient;
  });
}

async function getEntriesCollection(): Promise<Collection<Entry>> {
  return getMongoCollection(mongoRepositories.entries);
}

async function getFilmlistImportCollection(): Promise<Collection<FilmlistImportRecord>> {
  return getMongoCollection(mongoRepositories.filmlistImports);
}

function filmlistProvider(): FilmlistProvider {
  const options: S3FilmlistProviderOptions = {
    url: MVW_VERTEILER_S3_URL,
    accessKey: '',
    secretKey: '',
    latest: { bucket: 'verteiler', object: 'Filmliste-akt.xz' },
    archive: { bucket: 'verteiler-archiv', timestampStrategy: FilmlistResourceTimestampStrategy.FileName }
  };

  return singleton(S3FilmlistProvider, () => new S3FilmlistProvider(MVW_VERTEILER_FILMLIST_PROVIDER_INSTANCE_NAME, options));
}

async function getDistributedLoopProvider(): Promise<DistributedLoopProvider> {
  return singleton(DistributedLoopProvider, async () => {
    const lockProvider = await getLockProvider();
    return new DistributedLoopProvider(lockProvider);
  });
}

async function getEntriesImporterModule(): Promise<EntriesImporterModule> {
  return singleton(EntriesImporterModule, async () => {
    const entryRepository = await getEntryRepository();
    const logger = getLogger(ENTRIES_IMPORTER_MODULE_LOG);
    const source = await getFilmlistEntrySource();

    return new EntriesImporterModule(entryRepository, logger, [source]);
  });
}

async function getEntryRepository(): Promise<EntryRepository> {
  return getMongoRepository(MongoEntryRepository, mongoRepositories.entries);
}

async function getFilmlistImportRepository(): Promise<FilmlistImportRepository> {
  return getMongoRepository(MongoFilmlistImportRepository, mongoRepositories.filmlistImports);
}

function aggregatedEntryDataSource(): AggregatedEntryDataSource {
  return singleton(NonWorkingAggregatedEntryDataSource, () => new NonWorkingAggregatedEntryDataSource());
}

async function getEntrySearchEngine(): Promise<SearchEngine<AggregatedEntry>> {
  return singleton(ElasticsearchSearchEngine, async () => {
    const elasticsearch = await getElasticsearch();
    const converter = getElasticsearchConverter();
    const lockProvider = await getLockProvider();
    const logger = getLogger(SEARCH_ENGINE_LOG);

    const elasticsearchSearchEngine = new ElasticsearchSearchEngine<AggregatedEntry>(elasticsearch, converter, ELASTICSEARCH_INDEX_NAME, lockProvider, logger, ELASTICSEARCH_INDEX_SETTINGS, ELASTICSEARCH_INDEX_MAPPING);

    disposer.add(async () => elasticsearchSearchEngine[disposeAsync]());

    await elasticsearchSearchEngine.initialize();

    return elasticsearchSearchEngine;
  });
}

function getElasticsearchConverter(): Converter {
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

async function getFilmlistEntrySource(): Promise<FilmlistEntrySource> {
  return singleton(FilmlistEntrySource, async () => {
    const filmlistProvider = getFilmlistProvider();
    const filmlistImportRepository = await getFilmlistImportRepository();
    const importQueue = await getFilmlistImportQueue();
    const lockProvider = await getLockProvider();
    const logger = getLogger(FILMLIST_ENTRY_SOURCE);

    return new FilmlistEntrySource(filmlistProvider, filmlistImportRepository, importQueue, lockProvider, logger);
  });
}

async function getFilmlistManagerModule(): Promise<FilmlistManagerModule> {
  return singleton(FilmlistManagerModule, async () => {
    const keyValueStore = await getKeyValueStore<FilmlistManagerKeyValues>(filmlistManagerKeyValueStoreScope);
    const filmlistImportRepository = await getFilmlistImportRepository();
    const filmlistImportQueue = await getFilmlistImportQueue();
    const filmlistProvider = getFilmlistProvider();
    const distributedLoopProvider = await getDistributedLoopProvider();
    const logger = getLogger(FILMLIST_MANAGER_MODULE_LOG);

    return new FilmlistManagerModule(keyValueStore, filmlistImportRepository, filmlistImportQueue, filmlistProvider, distributedLoopProvider, logger);
  });
}
