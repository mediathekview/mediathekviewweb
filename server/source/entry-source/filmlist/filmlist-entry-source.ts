import type { Entry } from '$shared/models/core';
import { FilmlistImportJobData, FilmlistImportRecord, FilmlistImportRecordState } from '$shared/models/filmlist';
import type { LockProvider } from '@tstdl/base/lock';
import type { Logger } from '@tstdl/base/logger';
import type { Job, Queue } from '@tstdl/base/queue';
import { currentTimestamp, Timer } from '@tstdl/base/utils';
import type { CancellationToken } from '@tstdl/base/utils/cancellation-token';
import { EntityPatch } from '@tstdl/database';
import type { FilmlistImportRepository } from '../../repositories/filmlist-import.repository';
import type { EntrySource } from '../entry-source';
import type { FilmlistProvider } from './provider';

export class FilmlistEntrySource implements EntrySource {
  private readonly filmlistProvider: FilmlistProvider;
  private readonly filmlistImportRepository: FilmlistImportRepository;
  private readonly importQueue: Queue<FilmlistImportJobData>;
  private readonly lockProvider: LockProvider;
  private readonly logger: Logger;

  constructor(filmlistProvider: FilmlistProvider, filmlistImportRepository: FilmlistImportRepository, importQueue: Queue<FilmlistImportJobData>, lockProvider: LockProvider, logger: Logger) {
    this.filmlistProvider = filmlistProvider;
    this.filmlistImportRepository = filmlistImportRepository;
    this.importQueue = importQueue;
    this.lockProvider = lockProvider;
    this.logger = logger;
  }

  async *getEntries(cancellationToken: CancellationToken): AsyncIterableIterator<Entry[]> {
    const consumer = this.importQueue.getConsumer(cancellationToken);

    for await (const job of consumer) {
      try {
        yield* this.processFilmlistImport(job, this.importQueue, cancellationToken);

        if (cancellationToken.isSet) {
          break;
        }
      }
      catch (error: unknown) {
        this.logger.error(error as Error);
      }
    }
  }

  // eslint-disable-next-line max-statements, max-lines-per-function
  private async *processFilmlistImport(job: Job<FilmlistImportJobData>, importQueue: Queue<FilmlistImportJobData>, cancellationToken: CancellationToken): AsyncIterableIterator<Entry[]> {
    const importTimestamp = currentTimestamp();
    const filmlistImportId = job.data.filmlistImportId;
    const filmlistImport = await this.filmlistImportRepository.load(filmlistImportId);

    const filmlist = await this.filmlistProvider.getFromResource(filmlistImport.resource);
    const { id: filmlistId, timestamp: filmlistTimestamp } = await filmlist.getMetadata();

    const lock = this.lockProvider.get(`filmlist:${filmlistId}`);

    let hasFilmlist = false;
    const { success } = await lock.using(30000, false, async () => {
      hasFilmlist = await this.filmlistImportRepository.hasFilmlistResourceImport(filmlistImport.id, filmlistId);

      const update: EntityPatch<FilmlistImportRecord> = hasFilmlist
        ? { state: FilmlistImportRecordState.Duplicate, filmlistId, filmlistTimestamp, importTimestamp }
        : { filmlistId, filmlistTimestamp, importTimestamp };

      await this.filmlistImportRepository.patch(filmlistImport, update);
    });

    if (!success) {
      throw new Error('failed acquiring lock');
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (hasFilmlist) {
      this.logger.info(`skipping import of filmlist ${filmlistMetadata.id}, because it already is (being) imported`);
      await importQueue.acknowledge(job);
      return;
    }

    const date = new Date(filmlistMetadata.timestamp);
    this.logger.info(`processing filmlist ${filmlistMetadata.id} from ${date.toString()}`);

    const timer = new Timer(true);
    let entriesCount = 0;

    for await (const entries of filmlist) {
      entriesCount += entries.length;
      yield entries;

      if (cancellationToken.isSet) {
        return;
      }
    }

    const processData: FilmlistImportProcessData = { state: 'ok', filmlistMetadata, importTimestamp, importDuration: timer.milliseconds, entriesCount };
    await this.filmlistImportRepository.updateState(filmlistImport.id, processData);
    await importQueue.acknowledge(job);
  }
}
