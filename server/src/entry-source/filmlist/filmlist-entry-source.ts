import { Logger } from '../../common/logger';
import { Entry } from '../../common/model';
import { CancellationToken } from '../../common/utils/cancellation-token';
import { keys } from '../../keys';
import { QueueProvider } from '../../queue';
import { FilmlistImportRepository } from '../../repository/filmlists-import-repository';
import { EntrySource } from '../entry-source';
import { Filmlist } from './filmlist';

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
    const importQueue = this.queueProvider.get<Filmlist>(keys.FilmlistImportQueue, 5 * 60 * 1000, 3);

    await importQueue.initialize();

    const consumer = importQueue.getConsumer(cancellationToken);

    for await (const job of consumer) {
      const { data: filmlist } = job;

      try {
        yield* this.processFilmlist(filmlist, cancellationToken);

        if (cancellationToken.isSet) {
          break;
        }

        await .add(filmlist.date);
        await importQueue.acknowledge(job);
      }
      catch (error) {
        this.logger.error(error as Error);
      }
    }

    await importQueue.dispose();
  }

  private async *processFilmlist(filmlist: Filmlist, cancellationToken: CancellationToken): AsyncIterableIterator<Entry[]> {
    this.logger.info(`processing filmlist from ${filmlist.date}`);

    for await (const entry of filmlist) { // tslint:disable-line: await-promise
      yield entry;

      if (cancellationToken.isSet) {
        break;
      }
    }
  }
}
