import * as FS from 'fs';
import * as HJSON from 'hjson';
import * as Path from 'path';

const configPath = Path.join(__dirname, 'config.hjson');
const configFileExists = false; // FS.existsSync(configPath);

type EnvironmentConfig = {
  dataDirectory?: string,
  elasticsearch_host?: string;
  elasticsearch_port?: string;

  redis_host?: string;
  redis_port?: string;
  redis_password?: string;
  redis_db?: string;

  importer_latestCheckInterval?: string;
  importer_archiveCheckInterval?: string;
  importer_archiveRange?: string;
}

interface Config {
  dataDirectory: string;

  api: {
    port: number;
  }

  elasticsearch: {
    host: string;
    port: number;
  }

  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  }

  importer: {
    latestCheckInterval: number;
    archiveCheckInterval: number;
    archiveRange: number;
  }
}

const config: Config = {
  dataDirectory: './data',

  api: {
    port: 8080
  },

  elasticsearch: {
    host: 'localhost',
    port: 9200
  },

  redis: {
    host: 'localhost',
    port: 6379,
    password: undefined,
    db: 0
  },

  importer: {
    latestCheckInterval: 60 * 1,
    archiveCheckInterval: 60 * 1,
    archiveRange: 0
  }
}

if (configFileExists) {
  const configFileString = FS.readFileSync(configPath, { encoding: 'utf-8' });
  const fileConfig = HJSON.parse(configFileString) as Config;

  if (fileConfig.dataDirectory != undefined) {
    config.dataDirectory = fileConfig.dataDirectory;
  }

  config.elasticsearch = { ...config.elasticsearch, ...fileConfig.elasticsearch };
  config.redis = { ...config.redis, ...fileConfig.redis };
  config.importer = { ...config.importer, ...fileConfig.importer };

  if (typeof config.elasticsearch.port == 'string') {
    config.elasticsearch.port = Number.parseInt(config.elasticsearch.port);
  }

  if (typeof config.redis.port == 'string') {
    config.redis.port = Number.parseInt(config.redis.port);
  }

  if (typeof config.redis.db == 'string') {
    config.redis.db = Number.parseInt(config.redis.db);
  }

  if (typeof config.importer.latestCheckInterval == 'string') {
    config.importer.latestCheckInterval = Number.parseInt(config.importer.latestCheckInterval);
  }

  if (typeof config.importer.archiveCheckInterval == 'string') {
    config.importer.archiveCheckInterval = Number.parseInt(config.importer.archiveCheckInterval);
  }

  if (typeof config.importer.archiveRange == 'string') {
    config.importer.archiveRange = Number.parseInt(config.importer.archiveRange);
  }
}

export default config as Config;
