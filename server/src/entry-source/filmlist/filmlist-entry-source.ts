import { Logger } from '../../common/logger';
import { Entry } from '../../common/model';
import { currentTimestamp } from '../../common/utils';
import { CancellationToken } from '../../common/utils/cancellation-token';
import { keys } from '../../keys';
import { FilmlistImport, FilmlistImportQueueItem } from '../../model/filmlist-import';
import { QueueProvider } from '../../queue';
import { FilmlistImportRepository } from '../../repository/filmlists-import-repository';
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
    await importQueue.initialize();

    const consumer = importQueue.getConsumer(cancellationToken);

    for await (const job of consumer) {
      const { data: filmlistImportQueueItem } = job;

      try {
        const filmlistImport = await this.filmlistImportRepository.load(filmlistImportQueueItem.filmlistImportId);

        yield* this.processFilmlistImport(filmlistImport, cancellationToken);

        if (cancellationToken.isSet) {
          break;
        }

        filmlistImport.processedTimestamp = currentTimestamp();

        await this.filmlistImportRepository.update(filmlistImport);
        await importQueue.acknowledge(job);
      }
      catch (error) {
        this.logger.error(error as Error);
      }
    }

    await importQueue.dispose();
  }

  private async *processFilmlistImport(filmlistImport: FilmlistImport, cancellationToken: CancellationToken): AsyncIterableIterator<Entry[]> {
    const date = new Date(filmlistImport.filmlist.timestamp);
    this.logger.info(`processing filmlist from ${date}`);

    const parsedFilmlistResource = parseFilmlistResource(filmlistImport.filmlist.resource, false);

    for await (const { entries } of parsedFilmlistResource) { // tslint:disable-line: await-promise
      yield entries;

      if (cancellationToken.isSet) {
        break;
      }
    }
  }
}
