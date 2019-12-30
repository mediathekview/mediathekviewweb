import { Logger } from '@tstdl/base/logger';
import { Job, Queue, QueueProvider } from '@tstdl/base/queue';
import { currentTimestamp } from '@tstdl/base/utils';
import { CancellationToken } from '@tstdl/base/utils/cancellation-token';
import { Entry } from '../../common/models';
import { keys } from '../../keys';
import { FilmlistImportQueueItem } from '../../models/filmlist-import';
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

  // tslint:disable-next-line: no-async-without-await
  async *getEntries(cancellationToken: CancellationToken): AsyncIterableIterator<Entry[]> {
    const importQueue = this.queueProvider.get<FilmlistImportQueueItem>(keys.FilmlistImportQueue, 5 * 60 * 1000);

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
        return;
      }
    }

    const processedTimestamp = currentTimestamp();

    await this.filmlistImportRepository.setProcessed(filmlistImport.id, { processedTimestamp, numberOfEntries });
    await importQueue.acknowledge(job);
  }
}
