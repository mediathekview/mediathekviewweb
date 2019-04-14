import { Logger } from '@common-ts/base/logger';
import { currentTimestamp } from '@common-ts/base/utils';
import { CancellationToken } from '@common-ts/base/utils/cancellation-token';
import { Entry } from '../../common/model';
import { keys } from '../../keys';
import { FilmlistImportQueueItem } from '../../model/filmlist-import';
import { Job, Queue, QueueProvider } from '../../queue';
import { FilmlistImportRepository } from '../../repositories/filmlists-import-repository';
import { EntrySource } from '../entry-source';
import { parseFilmlistResource } from './filmlist-parser';

export class FilmlistEntrySource implements EntrySource {
  private readonly filmlistImportRepository: FilmlistImportRepository;
  private readonly queueProvider: QueueProvider;
  private readonly logger: Logger;

  constructor(filmlistImportRepository: FilmlistImportRepository, queueProvider: QueueProvider, logger: Logger) {
    this.filmlistImportRepository = filmlistImportRepository;
    this.queueProvider = queueProvider;
    this.logger = logger;
  }

  async *getEntries(cancellationToken: CancellationToken): AsyncIterableIterator<Entry[]> {
    const importQueue = this.queueProvider.get<FilmlistImportQueueItem>(keys.FilmlistImportQueue, 5 * 60 * 1000, 3);

    try {
      await importQueue.initialize();

      const consumer = importQueue.getConsumer(cancellationToken);

      for await (const job of consumer) {
        try {
          yield* this.processFilmlistImport(job, importQueue, cancellationToken);

          if (cancellationToken.isSet) {
            break;
          }
        }
        catch (error) {
          this.logger.error(error as Error);
        }
      }
    }
    finally {
      await importQueue.dispose();
    }
  }

  private async *processFilmlistImport(job: Job<FilmlistImportQueueItem>, importQueue: Queue<FilmlistImportQueueItem>, cancellationToken: CancellationToken): AsyncIterableIterator<Entry[]> {
    const filmlistImportQueueItem = job.data;
    const filmlistImport = await this.filmlistImportRepository.load(filmlistImportQueueItem.filmlistImportId);

    const date = new Date(filmlistImport.filmlist.timestamp);
    this.logger.info(`processing filmlist from ${date}`);

    const parsedFilmlistResource = parseFilmlistResource(filmlistImport.filmlist.resource, false);
    let numberOfEntries = 0;

    for await (const { entries } of parsedFilmlistResource) { // tslint:disable-line: await-promise
      numberOfEntries += entries.length;
      yield entries;

      if (cancellationToken.isSet) {
        break;
      }
    }

    const processedTimestamp = currentTimestamp();

    await this.filmlistImportRepository.setProcessed(filmlistImport.id, { processedTimestamp, numberOfEntries });
    await importQueue.acknowledge(job);
  }
}
