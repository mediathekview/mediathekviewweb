import { LockProvider } from '@tstdl/base/lock';
import { Logger } from '@tstdl/base/logger';
import { Job, Queue } from '@tstdl/base/queue';
import { currentTimestamp, Timer } from '@tstdl/base/utils';
import { CancellationToken } from '@tstdl/base/utils/cancellation-token';
import { Entry } from '../../common/models';
import { FilmlistImportQueueItem } from '../../models';
import { FilmlistImportProcessData, FilmlistImportRepository } from '../../repositories/filmlist-import-repository';
import { EntrySource } from '../entry-source';
import { FilmlistProvider } from './provider';

export class FilmlistEntrySource implements EntrySource {
  private readonly filmlistProvider: FilmlistProvider;
  private readonly filmlistImportRepository: FilmlistImportRepository;
  private readonly importQueue: Queue<FilmlistImportQueueItem>;
  private readonly lockProvider: LockProvider;
  private readonly logger: Logger;

  constructor(filmlistProvider: FilmlistProvider, filmlistImportRepository: FilmlistImportRepository, importQueue: Queue<FilmlistImportQueueItem>, lockProvider: LockProvider, logger: Logger) {
    this.filmlistProvider = filmlistProvider;
    this.filmlistImportRepository = filmlistImportRepository;
    this.importQueue = importQueue;
    this.lockProvider = lockProvider;
    this.logger = logger;
  }

  // tslint:disable-next-line: no-async-without-await
  async *getEntries(cancellationToken: CancellationToken): AsyncIterableIterator<Entry[]> {
    const consumer = this.importQueue.getConsumer(cancellationToken);

    for await (const job of consumer) {
      try {
        yield* this.processFilmlistImport(job, this.importQueue, cancellationToken);

        if (cancellationToken.isSet) {
          break;
        }
      }
      catch (error) {
        this.logger.error(error as Error);
      }
    }
  }

  private async *processFilmlistImport(job: Job<FilmlistImportQueueItem>, importQueue: Queue<FilmlistImportQueueItem>, cancellationToken: CancellationToken): AsyncIterableIterator<Entry[]> {
    const importTimestamp = currentTimestamp();
    const filmlistImportId = job.data.filmlistImportId;
    const filmlistImport = await this.filmlistImportRepository.load(filmlistImportId);

    if (filmlistImport == undefined) {
      throw new Error(`filmlist-import ${filmlistImportId} not found`);
    }

    const filmlist = await this.filmlistProvider.getFromResource(filmlistImport.resource);
    const filmlistMetadata = await filmlist.getMetadata();

    const lock = this.lockProvider.get(`filmlist:${filmlistMetadata.id}`);

    let hasFilmlist = false;
    const success = await lock.acquire(30000, async () => {
      hasFilmlist = await this.filmlistImportRepository.hasFilmlistFromOtherImport(filmlistImport.id, filmlistMetadata.id);

      const update: FilmlistImportProcessData = hasFilmlist
        ? { state: 'duplicate', filmlistMetadata, importTimestamp }
        : { filmlistMetadata, importTimestamp };

      await this.filmlistImportRepository.update(filmlistImport.id, update);
    });

    if (!success) {
      throw new Error('failed acquiring lock');
    }

    if (hasFilmlist) {
      this.logger.info(`skipping import of filmlist ${filmlistMetadata.id}, because it already is (being) imported`);
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
    await this.filmlistImportRepository.update(filmlistImport.id, processData);
    await importQueue.acknowledge(job);
  }
}
