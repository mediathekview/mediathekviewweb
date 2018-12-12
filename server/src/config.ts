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

type Config = {
  dataDirectory: string,
  api: {
    port: number
  },
  elasticsearch: {
    host: string,
    port: number
  },
  redis: {
    host: string,
    port: number,
    password?: string,
    db: number
  },
  importer: {
    latestCheckInterval: number,
    archiveCheckInterval: number,
    archiveRange: number
  }
};

export const config: Config = {
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
