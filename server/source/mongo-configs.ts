import type { Entry } from '$shared/models/core';
import type { FilmlistImportJobData, FilmlistImportRecord } from '$shared/models/filmlist';
import type { MongoKeyValue } from '@tstdl/mongo';
import { getMongoQueueConfig, getMongoRepositoryConfig } from '@tstdl/mongo/instance-provider';
import type { MongoLockEntity } from '@tstdl/mongo/lock';
import type { MongoJob } from '@tstdl/mongo/queue/job';
import type { MigrationState } from '@tstdl/server/migration';

export const mongoRepositories = {
  entries: getMongoRepositoryConfig<Entry>('entries'),
  filmlistImportQueue: getMongoRepositoryConfig<MongoJob<FilmlistImportJobData>>('filmlist-import-queue'),
  filmlistImports: getMongoRepositoryConfig<FilmlistImportRecord>('filmlist-import-records'),
  locks: getMongoRepositoryConfig<MongoLockEntity>('locks'),
  migrationStates: getMongoRepositoryConfig<MigrationState>('migration-states'),
  keyValues: getMongoRepositoryConfig<MongoKeyValue>('key-values')
};

export const mongoQueues = {
  filmlistImportQueue: getMongoQueueConfig(mongoRepositories.filmlistImportQueue, 5 * 60 * 1000, 3)
};
