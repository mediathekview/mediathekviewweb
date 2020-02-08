import { LogLevel } from '@tstdl/base/logger';

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
  importer: {
    latestCheckIntervalMinutes: number,
    archiveCheckIntervalMinutes: number,
    archiveRange: number
  }
};

export const configValidators = {
  integer: /^-?\d+$/,
  positiveInteger: /^[1-9]\d*$/,
  boolean: /true|false/i
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
    search: boolean('API_SEARCH', true),
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
  importer: {
    latestCheckIntervalMinutes: positiveInteger('FILMLIST_LATEST_CHECK_INTERVAL', 1),
    archiveCheckIntervalMinutes: positiveInteger('FILMLIST_ARCHIVE_CHECK_INTERVAL', 30),
    archiveRange: positiveInteger('FILMLIST_ARCHIVE_RANGE', 5)
  }
};

function boolean(variable: string, defaultValue: boolean): boolean {
  const stringValue = string(variable, defaultValue.toString(), configValidators.boolean);
  const value = stringValue.toLowerCase() == 'true';

  return value;
}

function integer(variable: string, defaultValue: number): number {
  const stringValue = string(variable, defaultValue.toString(), configValidators.integer);
  const value = parseInt(stringValue);

  return value;
}

function positiveInteger(variable: string, defaultValue: number): number {
  const stringValue = string(variable, defaultValue.toString(), configValidators.positiveInteger);
  const value = parseInt(stringValue);

  return value;
}

function string(variable: string, defaultValue: string, validator?: RegExp): string {
  const environmentValue = process.env[variable];
  const value = environmentValue != undefined ? environmentValue : defaultValue;
  const valid = validator == undefined ? true : validator.test(value);

  if (!valid) {
    throw new Error(`invalid value for ${variable}`);
  }

  return value;
}
