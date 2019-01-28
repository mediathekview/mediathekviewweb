import { Logger } from '../../common/logger';
import { Entry } from '../../common/model';
import { CancelableAsyncIterableIterator } from '../../common/utils/cancelable-async-iterable';
import { CancellationToken } from '../../common/utils/cancellation-token';
import { DatastoreFactory, DataType } from '../../datastore';
import { Keys } from '../../keys';
import { QueueProvider } from '../../queue';
import { EntrySource } from '../entry-source';
import { Filmlist } from './filmlist';

export class FilmlistEntrySource implements EntrySource {
  private readonly datastoreFactory: DatastoreFactory;
  private readonly queueProvider: QueueProvider;
  private readonly logger: Logger;

  constructor(datastoreFactory: DatastoreFactory, queueProvider: QueueProvider, logger: Logger) {
    this.datastoreFactory = datastoreFactory;
    this.queueProvider = queueProvider;
    this.logger = logger;
  }

  async *getEntries(cancellationToken: CancellationToken): AsyncIterableIterator<Entry[]> {
    const importQueue = this.queueProvider.get<Filmlist>(Keys.FilmlistImportQueue, 5 * 60 * 1000, 3);
    const importedFilmlistDates = this.datastoreFactory.set<Date>(Keys.ImportedFilmlistDates, DataType.Date);

    await importQueue.initialize();

    const consumer = importQueue.getConsumer(cancellationToken);

    for await (const job of consumer) {
      const { data: filmlist } = job;

      try {
        yield* this.processFilmlist(filmlist, cancellationToken);

        if (cancellationToken.isSet) {
          break;
        }

        await importedFilmlistDates.add(filmlist.date);
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

    const cancelableFilmlist = CancelableAsyncIterableIterator(filmlist, cancellationToken);

    for await (const entry of cancelableFilmlist) { // tslint:disable-line: await-promise
      yield entry;

      if (cancellationToken.isSet) {
        break;
      }
    }
  }
}
