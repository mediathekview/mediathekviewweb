import { Logger } from '../../common/logger';
import { Entry } from '../../common/model';
import { DatastoreFactory, DataType, Set } from '../../datastore';
import { Keys } from '../../keys';
import { Queue, QueueProvider } from '../../queue';
import { EntrySource } from '../entry-source';
import { Filmlist } from './filmlist';

export class FilmlistEntrySource implements EntrySource {
  private readonly importQueue: Queue<Filmlist>;
  private readonly importedFilmlistDates: Set<Date>;
  private readonly logger: Logger;

  private disposed: boolean;

  constructor(datastoreFactory: DatastoreFactory, queueProvider: QueueProvider, logger: Logger) {
    this.logger = logger;

    this.importQueue = queueProvider.get(Keys.FilmlistImportQueue, 5 * 60 * 1000);
    this.importedFilmlistDates = datastoreFactory.set(Keys.ImportedFilmlistDates, DataType.Date);
  }

  async dispose(): Promise<void> {
    this.disposed = true;
    await this.importQueue.dispose();
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<Entry[]> {
    const consumer = this.importQueue.getConsumer(false);

    if (this.disposed) {
      return;
    }

    for await (const job of consumer) {
      const { data: filmlist } = job;
      this.logger.info(`processing filmlist from ${filmlist.date}`);

      let hasError = false;
      try {
        yield* filmlist;
      }
      catch (error) {
        hasError = true;
        this.logger.error(error);
      }
      finally {
        if (!hasError) {
          await this.importedFilmlistDates.add(filmlist.date);
          await this.importQueue.acknowledge(job);
        }
      }

      if (this.disposed) {
        break;
      }
    }
  }
}
