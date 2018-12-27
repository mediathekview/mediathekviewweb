import { Logger } from '../../common/logger';
import { Entry } from '../../common/model';
import { DatastoreFactory, DataType, Set } from '../../datastore';
import { Keys } from '../../keys';
import { Queue, QueueProvider } from '../../queue';
import { EntrySource } from '../entry-source';
import { Filmlist } from './filmlist';
import { AsyncDisposer } from '../../common/disposable';

export class FilmlistEntrySource implements EntrySource {
  private readonly disposer: AsyncDisposer;
  private readonly importQueue: Queue<Filmlist>;
  private readonly importedFilmlistDates: Set<Date>;
  private readonly logger: Logger;

  constructor(datastoreFactory: DatastoreFactory, queueProvider: QueueProvider, logger: Logger) {
    this.logger = logger;

    this.disposer = new AsyncDisposer();
    this.importQueue = queueProvider.get(Keys.FilmlistImportQueue, 5 * 60 * 1000, 3);
    this.importedFilmlistDates = datastoreFactory.set(Keys.ImportedFilmlistDates, DataType.Date);

    this.disposer.addSubDisposables(this.importQueue);
  }

  async initialize(): Promise<void> {
    await this.importQueue.initialize();
  }

  async dispose(): Promise<void> {
    await this.disposer.dispose();
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<Entry[]> {
    if (this.disposer.disposing) {
      throw new Error('disposing');
    }

    const consumer = this.importQueue.getConsumer(false);

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

      if (this.disposer.disposing) {
        break;
      }
    }
  }
}
