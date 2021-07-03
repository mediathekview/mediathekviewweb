import type { FilmlistResource } from '$root/entry-source/filmlist';
import type { FilmlistImportJobData, NewFilmlistImportRecord } from '$shared/models/filmlist';
import { FilmlistImportRecordState } from '$shared/models/filmlist';
import { AsyncEnumerable } from '@tstdl/base/enumerable';
import type { KeyValueStore } from '@tstdl/base/key-value';
import type { Logger } from '@tstdl/base/logger';
import type { Queue } from '@tstdl/base/queue';
import type { AnyIterable } from '@tstdl/base/utils';
import { currentTimestamp } from '@tstdl/base/utils';
import type { CancellationToken } from '@tstdl/base/utils/cancellation-token';
import type { DistributedLoopProvider } from '@tstdl/server/distributed-loop';
import type { Module } from '@tstdl/server/module';
import { ModuleBase, ModuleMetricType } from '@tstdl/server/module';
import { config } from '../config';
import type { FilmlistProvider } from '../entry-source/filmlist/provider';
import { keys } from '../keys';
import type { FilmlistImportRepository } from '../repositories/filmlist-import.repository';

const LATEST_CHECK_INTERVAL = config.filmlistImporter.latestCheckIntervalMinutes * 60 * 1000;
const ARCHIVE_CHECK_INTERVAL = config.filmlistImporter.archiveCheckIntervalMinutes * 60 * 1000;
const MAX_AGE_DAYS = config.filmlistImporter.archiveRange;
const MAX_AGE_MILLISECONDS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

export type FilmlistManagerKeyValues = {
  lastLatestCheck: number,
  lastArchiveCheck: number
};

export class FilmlistManagerModule extends ModuleBase implements Module {
  private readonly keyValueStore: KeyValueStore<FilmlistManagerKeyValues>;
  private readonly filmlistImportRepository: FilmlistImportRepository;
  private readonly filmlistImportQueue: Queue<FilmlistImportJobData>;
  private readonly filmlistProvider: FilmlistProvider;
  private readonly distributedLoopProvider: DistributedLoopProvider;
  private readonly logger: Logger;

  private enqueuedFilmlistsCount: number;

  readonly metrics = {
    enqueuedFilmlistsCount: {
      type: ModuleMetricType.Counter,
      getValue: () => this.enqueuedFilmlistsCount
    }
  };

  constructor(keyValueRepository: KeyValueStore<FilmlistManagerKeyValues>, filmlistImportRepository: FilmlistImportRepository, filmlistImportQueue: Queue<FilmlistImportJobData>, filmlistProvider: FilmlistProvider, distributedLoopProvider: DistributedLoopProvider, logger: Logger) {
    super('FilmlistManager');

    this.keyValueStore = keyValueRepository;
    this.filmlistImportRepository = filmlistImportRepository;
    this.filmlistImportQueue = filmlistImportQueue;
    this.filmlistProvider = filmlistProvider;
    this.distributedLoopProvider = distributedLoopProvider;
    this.logger = logger;
  }

  protected async _run(_cancellationToken: CancellationToken): Promise<void> {
    const distributedLoop = this.distributedLoopProvider.get(keys.FilmlistManagerLoop);

    const loopController = distributedLoop.run(60000, 10000, async () => this.check());
    await this.cancellationToken;

    await loopController.stop();
  }

  private async check(): Promise<void> {
    await this.compareTime('lastLatestCheck', LATEST_CHECK_INTERVAL, async () => this.checkLatest());
    await this.compareTime('lastArchiveCheck', ARCHIVE_CHECK_INTERVAL, async () => this.checkArchive());
  }

  private async compareTime(key: keyof FilmlistManagerKeyValues, interval: number, func: () => Promise<void>): Promise<void> {
    const lastCheck = await this.keyValueStore.get(key, 0);
    const now = currentTimestamp();
    const difference = now - lastCheck;

    if (difference >= interval) {
      await func();
      await this.keyValueStore.set(key, now);
    }
  }

  private async checkLatest(): Promise<void> {
    this.logger.verbose('checking for new current-filmlist');
    const latest = this.filmlistProvider.getLatest();
    await this.enqueueMissingFilmlistResources(latest, 0);
  }

  private async checkArchive(): Promise<void> {
    this.logger.verbose('checking for new archive-filmlist');

    const minimumTimestamp = currentTimestamp() - MAX_AGE_MILLISECONDS;

    const archive = this.filmlistProvider.getArchive(minimumTimestamp);
    await this.enqueueMissingFilmlistResources(archive, minimumTimestamp);
  }

  private async enqueueMissingFilmlistResources(resources: AnyIterable<FilmlistResource>, minimumTimestamp: number): Promise<void> {
    const filmlistsEnumerable = new AsyncEnumerable(resources);

    await filmlistsEnumerable
      .while(() => !this.cancellationToken.isSet)
      .filter((resource) => resource.timestamp >= minimumTimestamp)
      .filter(async (resource) => !(await this.filmlistImportRepository.hasFilmlistResourceImport(resource.source, resource.tag)))
      .forEach(async (resource) => this.enqueueFilmlistResource(resource));
  }

  private async enqueueFilmlistResource(resource: FilmlistResource): Promise<void> {
    const filmlistImport: NewFilmlistImportRecord = {
      resource,
      state: FilmlistImportRecordState.Pending,
      enqueueTimestamp: currentTimestamp()
    };

    const insertedFilmlistImport = await this.filmlistImportRepository.insert(filmlistImport);

    const filmlistImportQueueItem: FilmlistImportJobData = {
      filmlistImportId: insertedFilmlistImport.id
    };

    await this.filmlistImportQueue.enqueue(filmlistImportQueueItem);
    this.enqueuedFilmlistsCount++;
  }
}
