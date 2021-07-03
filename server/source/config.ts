import { LogLevel } from '@tstdl/base/logger';
import { boolean, integer, positiveInteger, string } from '@tstdl/base/utils/config-parser';

type Config = {
  verbosity: number,
  modules: {
    api: boolean,
    filmlistManager: boolean,
    importer: boolean,
    indexer: boolean
  },
  api: {
    port: number,
    search: boolean
  },
  elasticsearch: {
    url: string
  },
  redis: {
    host: string,
    port: number,
    password?: string,
    db: number
  },
  filmlistImporter: {
    latestCheckIntervalMinutes: number,
    archiveCheckIntervalMinutes: number,
    archiveRange: number
  }
};

export const configValidators = {
  integer: /^-?\d+$/u,
  positiveInteger: /^[1-9]\d*$/u,
  boolean: /true|false/ui
};

export const config: Config = {
  verbosity: integer('VERBOSITY', LogLevel.Info),
  modules: {
    api: boolean('SERVICE_API', false),
    filmlistManager: boolean('SERVICE_FILMLIST_MANAGER', false),
    importer: boolean('SERVICE_IMPORTER', false),
    indexer: boolean('SERVICE_INDEXER', false)
  },
  api: {
    port: positiveInteger('API_PORT', 8080),
    search: boolean('API_SEARCH', true)
  },
  elasticsearch: {
    url: string('ELASTICSEARCH_URL', 'http://localhost:9200')
  },
  redis: {
    host: string('REDIS_HOST', 'localhost'),
    port: positiveInteger('REDIS_PORT', 6379),
    password: string('REDIS_PASSWORD', ''),
    db: integer('REDIS_DATABASE', 0)
  },
  filmlistImporter: {
    latestCheckIntervalMinutes: positiveInteger('FILMLIST_LATEST_CHECK_INTERVAL', 3),
    archiveCheckIntervalMinutes: positiveInteger('FILMLIST_ARCHIVE_CHECK_INTERVAL', 60),
    archiveRange: positiveInteger('FILMLIST_ARCHIVE_RANGE', 25)
  }
};
