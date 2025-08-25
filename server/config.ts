import os from 'node:os';

import type { ClientOptions as OpenSearchClientOptions } from '@opensearch-project/opensearch';
import type { GlideClientConfiguration } from '@valkey/valkey-glide';

type Config = {
  dataDirectory: string,
  webserverPort: number,
  index: boolean,
  workerCount: number,
  workerArgs: string[],
  valkey: GlideClientConfiguration,
  opensearch: OpenSearchClientOptions,
  contact: {
    name: string,
    street: string,
    postcode: string,
    city: string,
    mail: string,
  },
  adsText: string,
  injectHtmlPath: string,
}

function hasEnv(variable: string): boolean {
  return (variable in process.env) && (process.env[variable]!.trim().length > 0);
}

function getEnvOrDefault<T extends string | number | boolean>(variable: string, defaultValue: T): T {
  if (!hasEnv(variable)) {
    return defaultValue;
  }

  const value = process.env[variable]!;

  if (typeof defaultValue === 'boolean') {
    const valid = /^(true|false|on|off|0|1)$/i.test(value);

    if (!valid) {
      throw new Error(`Invalid boolean value "${value}" for ${variable}`);
    }

    return (value === 'true' || value === 'on' || value === '1') as T;
  }

  if (typeof defaultValue === 'number') {
    const valid = /^\d+$/.test(value);
    if (!valid) {
      throw new Error(`Invalid integer value "${value}" for ${variable}`);
    }

    return Number.parseInt(value, 10) as T;
  }

  return value as T;
}


export const config: Config = {
  //path for storing data, can be absolute and relative
  dataDirectory: getEnvOrDefault('DATA_DIRECTORY', 'data/'),
  webserverPort: getEnvOrDefault('WEBSERVER_PORT', 8000),
  index: getEnvOrDefault('INDEX', true),

  workerCount: getEnvOrDefault('WORKER_COUNT', os.cpus().length),
  workerArgs: getEnvOrDefault('WORKER_ARGS', '').split(',').filter(arg => arg.length > 0),

  valkey: {
    addresses: [
      {
        host: getEnvOrDefault('VALKEY_HOST', '127.0.0.1'),
        port: getEnvOrDefault('VALKEY_PORT', 6379),
      }
    ],
    credentials: {
      username: getEnvOrDefault('VALKEY_USER', undefined),
      password: getEnvOrDefault('VALKEY_PASSWORD', undefined),
    },
    databaseId: getEnvOrDefault('VALKEY_DB', 2),
  },
  opensearch: {
    node: `http://${getEnvOrDefault('OPENSEARCH_HOST', 'localhost')}:${getEnvOrDefault('OPENSEARCH_PORT', '9200')}`,
  },

  contact: {
    name: getEnvOrDefault('CONTACT_NAME', 'Max Mustermann'),
    street: getEnvOrDefault('CONTACT_STREET', 'Musterstraße 111'),
    postcode: getEnvOrDefault('CONTACT_POSTCODE', '12345'),
    city: getEnvOrDefault('CONTACT_CITY', 'Musterstadt'),
    mail: getEnvOrDefault('CONTACT_MAIL', 'max@mustermann.tld'),
  },
  adsText: getEnvOrDefault('ADS_TEXT', ''),
  injectHtmlPath: getEnvOrDefault('INJECT_HTML_PATH', ''),
};
