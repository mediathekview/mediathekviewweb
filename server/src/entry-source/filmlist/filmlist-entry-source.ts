import { Logger } from '../../common/logger';
import { Entry } from '../../common/model';
import { DatastoreFactory, DataType, Set } from '../../datastore';
import { Keys } from '../../keys';
import { Queue, QueueProvider } from '../../queue';
import { EntrySource } from '../entry-source';
import { Filmlist } from './filmlist';
import { AsyncDisposer } from '../../common/disposable';
import { CancelableAsyncIterable } from '../../common/utils/cancelable-async-iterable';

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

    this.disposer.addDisposeTasks(async () => await this.importQueue.dispose());
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

    const deferrer = this.disposer.getDeferrer();
    const consumer = this.importQueue.getConsumer(false);

    try {
      for await (const job of consumer) {
        const { data: filmlist } = job;
        this.logger.info(`processing filmlist from ${filmlist.date}`);

        let hasError = false;
        try {
          const cancelableFilmlist = new CancelableAsyncIterable(filmlist, this.disposer.disposingPromise);
          yield* cancelableFilmlist;
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
    finally {
      deferrer.yield();
    }
  }
}
