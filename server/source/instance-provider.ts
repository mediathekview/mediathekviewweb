import type { FilmlistManagerKeyValues } from '$root/modules';
import { EntriesImporterModule, EntriesIndexerModule, FilmlistManagerModule } from '$root/modules';
import type { IndexedEntry } from '$shared/models/core';
import type { FilmlistImportJobData } from '$shared/models/filmlist';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
import { configureBaseInstanceProvider, disposer, getKeyValueStore, getLockProvider, getLogger } from '@tstdl/base/instance-provider';
import { LogLevel } from '@tstdl/base/logger';
import type { Queue } from '@tstdl/base/queue';
import { singleton } from '@tstdl/base/utils';
import { configureElasticInstanceProvider, getElasticSearchIndex } from '@tstdl/elasticsearch/instance-provider';
import { configureMongoInstanceProvider, getMongoKeyValueStoreProvider, getMongoLockProvider, getMongoMigrationStateRepository, getMongoQueue, getMongoRepository } from '@tstdl/mongo/instance-provider';
import type { SearchIndex } from '@tstdl/search-index';
import { DistributedLoopProvider } from '@tstdl/server/distributed-loop';
import { configureServerInstanceProvider, connect } from '@tstdl/server/instance-provider';
import type * as Mongo from 'mongodb';
import { config } from './config';
import type { AggregatedEntryDataSource } from './data-sources/aggregated-entry.data-source';
import { NonWorkingAggregatedEntryDataSource } from './data-sources/non-working-aggregated-entry.data-source';
import { elasticsearchMapping, elasticsearchSettings } from './elasticsearch-definitions';
import type { FilmlistProvider } from './entry-source/filmlist';
import { FilmlistEntrySource } from './entry-source/filmlist/filmlist-entry-source';
import type { S3FilmlistProviderOptions } from './entry-source/filmlist/providers';
import { FilmlistResourceTimestampStrategy, S3FilmlistProvider } from './entry-source/filmlist/providers';
import { MultiFilmlistProvider } from './entry-source/filmlist/providers/multi';
import { mongoQueues, mongoRepositories } from './mongo-configs';
import type { EntryRepository, FilmlistImportRepository } from './repositories';
import { MongoEntryRepository } from './repositories/mongo/entry.repository';
import { MongoFilmlistImportRepository } from './repositories/mongo/filmlist-import.repository';

const MVW_ARCHIVE_FILMLIST_PROVIDER_INSTANCE_NAME = 'mvw-verteiler';
const MV_VERTEILER_FILMLIST_PROVIDER_INSTANCE_NAME = 'mv-verteiler';
const S3_FILMLIST_ARCHIVE_ENDPOINT = 'https://s3.mediathekviewweb.de';
const S3_FILMLIST_ARCHIVE_BUCKET = 'verteiler-archiv';
const S3_LATEST_ENDPOINT = 'https://s3.mvorg.de';
const S3_LATEST_BUCKET = 'filmlisten';
const S3_LATEST_OBJECT = 'Filmliste-akt.xz';

const mvwArchivOptions: S3FilmlistProviderOptions = {
  url: S3_FILMLIST_ARCHIVE_ENDPOINT,
  accessKey: '',
  secretKey: '',
  archive: { bucket: S3_FILMLIST_ARCHIVE_BUCKET, timestampStrategy: FilmlistResourceTimestampStrategy.FileName }
};

const mvVerteilerOptions: S3FilmlistProviderOptions = {
  url: S3_LATEST_ENDPOINT,
  accessKey: '',
  secretKey: '',
  latest: { bucket: S3_LATEST_BUCKET, object: S3_LATEST_OBJECT }
};

const MONGO_CONNECTION_STRING = 'mongodb://localhost:27017';
const MONGO_CLIENT_OPTIONS: Mongo.MongoClientOptions = {
  appname: 'MediathekViewWeb',
  useUnifiedTopology: true,
  useNewUrlParser: true
};

const ELASTICSEARCH_INDEX_NAME = 'mediathekviewweb';
const ELASTICSEARCH_INDEX_SETTINGS = elasticsearchSettings;
const ELASTICSEARCH_INDEX_MAPPING = elasticsearchMapping;

const FILMLIST_ENTRY_SOURCE_LOG = 'FILMLIST SOURCE';
const S3_LOG = 'S3';
const SEARCH_ENGINE_LOG = 'SEARCH ENGINE';
const ELASTICSEARCH_LOG = 'ELASTICSEARCH';

const FILMLIST_MANAGER_MODULE_LOG = 'FILMLIST MANAGER';
const ENTRIES_IMPORTER_MODULE_LOG = 'IMPORTER';
const ENTRIES_INDEXER_MODULE_LOG = 'INDEXER';

const filmlistManagerKeyValueStoreScope = 'filmlist-manager';

configureBaseInstanceProvider({
  logLevel: LogLevel.Trace,
  lockProviderProvider: getMongoLockProvider,
  keyValueStoreProviderProvider: getMongoKeyValueStoreProvider
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

configureElasticInstanceProvider({
  clientOptions: {
    node: config.elasticsearch.url
  }
});

export async function getEntriesIndexerModule(): Promise<EntriesIndexerModule> {
  return singleton(EntriesIndexerModule, async () => {
    const aggregatedEntryDataSource = getAggregatedEntryDataSource();
    const searchIndex = await getEntrySearchIndex();
    const entryRepository = await getEntryRepository();
    const logger = getLogger(ENTRIES_INDEXER_MODULE_LOG);

    return new EntriesIndexerModule(entryRepository, aggregatedEntryDataSource, searchIndex, logger);
  });
}

export async function getFilmlistImportQueue(): Promise<Queue<FilmlistImportJobData>> {
  return getMongoQueue(mongoQueues.filmlistImportQueue);
}

export async function getElasticsearch(): Promise<ElasticsearchClient> {
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

export function getFilmlistProvider(): FilmlistProvider {
  return singleton(MultiFilmlistProvider, () => {
    const logger = getLogger(S3_LOG);

    const archive = new S3FilmlistProvider(MVW_ARCHIVE_FILMLIST_PROVIDER_INSTANCE_NAME, mvwArchivOptions, logger);
    const latest = new S3FilmlistProvider(MV_VERTEILER_FILMLIST_PROVIDER_INSTANCE_NAME, mvVerteilerOptions, logger);
    const provider = new MultiFilmlistProvider();

    // provider.registerProvider(archive);
    provider.registerProvider(latest);

    return provider;
  });
}

export async function getDistributedLoopProvider(): Promise<DistributedLoopProvider> {
  return singleton(DistributedLoopProvider, async () => {
    const lockProvider = await getLockProvider();
    return new DistributedLoopProvider(lockProvider);
  });
}

export async function getEntriesImporterModule(): Promise<EntriesImporterModule> {
  return singleton(EntriesImporterModule, async () => {
    const entryRepository = await getEntryRepository();
    const logger = getLogger(ENTRIES_IMPORTER_MODULE_LOG);
    const source = await getFilmlistEntrySource();

    return new EntriesImporterModule(entryRepository, logger, [source]);
  });
}

export async function getEntryRepository(): Promise<EntryRepository> {
  return getMongoRepository(MongoEntryRepository, mongoRepositories.entries);
}

export async function getFilmlistImportRepository(): Promise<FilmlistImportRepository> {
  return getMongoRepository(MongoFilmlistImportRepository, mongoRepositories.filmlistImports);
}

export function getAggregatedEntryDataSource(): AggregatedEntryDataSource {
  return singleton(NonWorkingAggregatedEntryDataSource, () => new NonWorkingAggregatedEntryDataSource());
}

export async function getEntrySearchIndex(): Promise<SearchIndex<IndexedEntry>> {
  return getElasticSearchIndex(Elasticsearch);
}

export async function getFilmlistEntrySource(): Promise<FilmlistEntrySource> {
  return singleton(FilmlistEntrySource, async () => {
    const filmlistProvider = getFilmlistProvider();
    const filmlistImportRepository = await getFilmlistImportRepository();
    const importQueue = await getFilmlistImportQueue();
    const lockProvider = await getLockProvider();
    const logger = getLogger(FILMLIST_ENTRY_SOURCE_LOG);

    return new FilmlistEntrySource(filmlistProvider, filmlistImportRepository, importQueue, lockProvider, logger);
  });
}

export async function getFilmlistManagerModule(): Promise<FilmlistManagerModule> {
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
