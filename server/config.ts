import * as Elasticsearch from 'elasticsearch';
import os from 'os';
import * as Redis from 'redis';

interface Config {
  dataDirectory: string;
  webserverPort: number;
  index: boolean;
  workerCount: number;
  workerArgs: string[];
  redis: Redis.ClientOpts;
  elasticsearch: Elasticsearch.ConfigOptions;
  matomo: {
    enabled: boolean,
    siteUrl: string,
    matomoUrl: string,
    token_auth: string,
    siteId: number
  },
  contact: {
    name: string,
    street: string,
    postcode: string,
    city: string,
    mail: string
  }
}

function hasEnv(variable: string): boolean {
  return (variable in process.env) && (process.env[variable].trim().length > 0);
}

function getEnvOrDefault(variable: string, defaultValue: any): any {
  const has = hasEnv(variable);
  return has ? process.env[variable] : defaultValue;
}

function getBooleanEnvOrDefault(variable: string, defaultValue: boolean): boolean {
  const has = hasEnv(variable);

  if (!has) {
    return defaultValue;
  }

  const value = process.env[variable].trim().toLowerCase();
  const valid = /^true|false|on|off|0|1$/.test(value);

  if (!valid) {
    throw new Error(`invalid value "${value}" for ${variable}`)
  }

  return value == 'true' || value == 'on' || value == '1';
}

function getIntegerEnvOrDefault(variable: string, defaultValue: number): number {
  const has = hasEnv(variable);

  if (!has) {
    return defaultValue;
  }

  const value = process.env[variable].trim();
  const valid = /\d+/.test(value);

  if (!valid) {
    throw new Error(`invalid value "${value}" for ${variable}`)
  }

  return Number.parseInt(value);
}

const config: Config = {
  //path for storing data, can be absolute and relative
  dataDirectory: getEnvOrDefault('DATA_DIRECTORY', 'data/'),
  webserverPort: getIntegerEnvOrDefault('WEBSERVER_PORT', 8000),
  index: getBooleanEnvOrDefault('INDEX', true),

  workerCount: getIntegerEnvOrDefault('WORKER_COUNT', os.cpus().length),
  workerArgs: getEnvOrDefault('WORKER_ARGS', ['--optimize_for_size', '--memory-reducer']),

  redis: {
    host: getEnvOrDefault('REDIS_HOST', '127.0.0.1'),
    port: getIntegerEnvOrDefault('REDIS_PORT', 6379),
    password: getEnvOrDefault('REDIS_PASSWORD', ''),
    db: getIntegerEnvOrDefault('REDIS_DB', 2)
  },
  elasticsearch: {
    host: getEnvOrDefault('ELASTICSEARCH_HOST', 'localhost') + ':' + getEnvOrDefault('ELASTICSEARCH_PORT', '9200')
  },
  matomo: {
    enabled: getBooleanEnvOrDefault('MATOMO_ENABLED', false),
    matomoUrl: getEnvOrDefault('MATOMO_URL', 'https://matomo.example.de/piwik.php'),
    siteUrl: getEnvOrDefault('MATOMO_SITE_URL', 'http://domain.tld'),
    token_auth: getEnvOrDefault('MATOMO_AUTH_TOKEN', 'abc123'),
    siteId: getIntegerEnvOrDefault('MATOMO_SITE_ID', 1)
  },

  contact: {
    name: getEnvOrDefault('CONTACT_NAME', 'Max Mustermann'),
    street: getEnvOrDefault('CONTACT_STREET', 'Musterstraße 111'),
    postcode: getEnvOrDefault('CONTACT_POSTCODE', '12345'),
    city: getEnvOrDefault('CONTACT_CITY', 'Musterstadt'),
    mail: getEnvOrDefault('CONTACT_MAIL', 'max@mustermann.tld')
  }
}

if (config.redis.password.length == 0) {
  delete config.redis.password;
}

export default config;