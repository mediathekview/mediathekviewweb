import type { FilmlistImportJobData } from '$shared/models/filmlist';
import { getMongoQueueConfig, getMongoRepositoryConfig } from '@tstdl/mongo/instance-provider';
import type { MongoLockEntity } from '@tstdl/mongo/lock';
import type { MongoJob } from '@tstdl/mongo/queue/job';

export const mongoRepositories = {
  entries: getMongoRepositoryConfig('entries'),
  filmlistImportQueue: getMongoRepositoryConfig<MongoJob<FilmlistImportJobData>>('filmlist-import-queue'),
  filmlistImports: getMongoRepositoryConfig('filmlist-imports'),
  locks: getMongoRepositoryConfig<MongoLockEntity>('locks')
};

export const mongoQueues = {
  filmlistImportQueue: getMongoQueueConfig(mongoRepositories.filmlistImportQueue, 5 * 60 * 1000, 3)
};
