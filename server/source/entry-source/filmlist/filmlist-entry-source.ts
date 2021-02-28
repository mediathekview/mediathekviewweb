import type { NewEntry } from '$shared/models/core';
import type { FilmlistEntry, FilmlistImportJobData, FilmlistImportRecord } from '$shared/models/filmlist';
import { FilmlistImportRecordState } from '$shared/models/filmlist';
import type { LockProvider } from '@tstdl/base/lock';
import type { Logger } from '@tstdl/base/logger';
import type { Job, Queue } from '@tstdl/base/queue';
import { currentTimestamp, Timer } from '@tstdl/base/utils';
import type { CancellationToken } from '@tstdl/base/utils/cancellation-token';
import type { EntityPatch } from '@tstdl/database';
import type { FilmlistImportRepository } from '../../repositories/filmlist-import.repository';
import type { EntrySource } from '../entry-source';
import { parseFilmlist } from './filmlist-parser';
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

  async *getEntries(cancellationToken: CancellationToken): AsyncIterableIterator<NewEntry[]> {
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
  private async *processFilmlistImport(job: Job<FilmlistImportJobData>, importQueue: Queue<FilmlistImportJobData>, cancellationToken: CancellationToken): AsyncIterableIterator<NewEntry[]> {
    const importTimestamp = currentTimestamp();
    const filmlistImportId = job.data.filmlistImportId;
    const filmlistImport = await this.filmlistImportRepository.load(filmlistImportId);

    const filmlistStream = await this.filmlistProvider.getFromResource(filmlistImport.resource);
    const filmlist = await parseFilmlist(filmlistStream);

    const lock = this.lockProvider.get(`filmlist:${filmlist.id}`);

    let hasFilmlist = false;
    const { success } = await lock.using(30000, false, async () => {
      hasFilmlist = await this.filmlistImportRepository.hasFilmlistResourceImport(filmlistImport.id, filmlist.id);

      const update: EntityPatch<FilmlistImportRecord> = hasFilmlist
        ? { state: FilmlistImportRecordState.Duplicate, filmlistId: filmlist.id, filmlistTimestamp: filmlist.timestamp, importTimestamp }
        : { filmlistId: filmlist.id, filmlistTimestamp: filmlist.timestamp, importTimestamp };

      await this.filmlistImportRepository.patch(filmlistImport, update);
    });

    if (!success) {
      throw new Error('failed acquiring lock');
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (hasFilmlist) {
      this.logger.info(`skipping import of filmlist ${filmlist.id}, because it already is (being) imported`);
      await importQueue.acknowledge(job);
      return;
    }

    const date = new Date(filmlist.timestamp);
    this.logger.info(`processing filmlist ${filmlist.id} from ${date.toString()}`);

    const timer = new Timer(true);
    let entriesCount = 0;

    for await (const entries of filmlist.entries) {
      entriesCount += entries.length;
      yield entries.map((entry) => toNewEntry(entry, filmlist.timestamp));

      if (cancellationToken.isSet) {
        return;
      }
    }

    await this.filmlistImportRepository.patch(filmlistImport, {
      state: FilmlistImportRecordState.Imported,
      importTimestamp,
      importDuration: timer.milliseconds,
      entriesCount
    });

    await importQueue.acknowledge(job);
  }
}

function toNewEntry(filmlistEntry: FilmlistEntry, filmlistTimestamp: number): NewEntry {
  const entry: NewEntry = {
    source: filmlistEntry.source,
    tag: filmlistEntry.tag,
    channel: filmlistEntry.channel,
    topic: filmlistEntry.topic,
    title: filmlistEntry.title,
    timestamp: filmlistEntry.timestamp,
    duration: filmlistEntry.duration,
    description: filmlistEntry.description,
    website: filmlistEntry.website,
    media: filmlistEntry.media,
    firstSeen: filmlistTimestamp,
    lastSeen: filmlistTimestamp
  };

  return entry;
}
