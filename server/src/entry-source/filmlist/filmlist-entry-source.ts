import { EntrySource } from '../';
import { Logger } from '../../common/logger';
import { Entry } from '../../common/model';
import { DatastoreFactory, DataType, Set } from '../../datastore';
import { Keys } from '../../keys';
import { Job, Queue, QueueProvider } from '../../queue';
import { Filmlist } from './filmlist';

export class FilmlistEntrySource implements EntrySource {
  private readonly importQueue: Queue<Filmlist>;
  private readonly importedFilmlistDates: Set<Date>;
  private readonly logger: Logger;

  constructor(datastoreFactory: DatastoreFactory, queueProvider: QueueProvider, logger: Logger) {
    this.logger = logger;

    this.importQueue = queueProvider.get(Keys.FilmlistImportQueue, 5 * 60 * 1000);
    this.importedFilmlistDates = datastoreFactory.set(Keys.ImportedFilmlistDates, DataType.Date);
  }

  private async *processFilmlist(job: Job<Filmlist>): AsyncIterableIterator<Entry[]> {
    const filmlist = job.data;

    this.logger.info(`processing filmlist ${filmlist.date}`);

    for await (const entryBatch of filmlist) {
      yield entryBatch;
    }

    await this.importedFilmlistDates.add(filmlist.date);
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<Entry[]> {
    const consumer = this.importQueue.getConsumer(false);

    for await (const job of consumer) {
      const entries = await this.processFilmlist(job);
      yield* entries;
    }
  }
}
