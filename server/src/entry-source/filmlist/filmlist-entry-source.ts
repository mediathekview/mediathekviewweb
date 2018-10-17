import { EntrySource } from '../';
import { Logger } from '../../common/logger';
import { Entry } from '../../common/model';
import { FeedableAsyncIterable } from '../../common/utils';
import { DatastoreFactory, DataType, Set } from '../../datastore';
import { Keys } from '../../keys';
import { Job, Queue, QueueProvider } from '../../queue';
import { Filmlist } from './filmlist';

export class FilmlistEntrySource implements EntrySource {
  private readonly out: FeedableAsyncIterable<Entry[]>;
  private readonly importQueue: Queue<Filmlist>;
  private readonly concurrency: number;
  private readonly importedFilmlistDates: Set<Date>;
  private readonly logger: Logger;

  private running: boolean;

  constructor(datastoreFactory: DatastoreFactory, queueProvider: QueueProvider, logger: Logger, concurrency: number) {
    this.logger = logger;
    this.concurrency = concurrency;

    this.out = new FeedableAsyncIterable();
    this.importQueue = queueProvider.get(Keys.FilmlistImportQueue);
    this.importedFilmlistDates = datastoreFactory.set(Keys.ImportedFilmlistDates, DataType.Date);
    this.running = false;
  }

  private async process(job: Job<Filmlist>) {
    let filmlist = job.data;

    this.logger.info(`processing filmlist ${filmlist.date}`);

    for await (const entry of filmlist) {
      if (this.out.bufferSize > 10) {
        await this.out.empty;
      }

      this.out.feed(entry);
    }

    await this.importedFilmlistDates.add(filmlist.date);
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<Entry[]> {
    if (!this.running) {
      this.importQueue.process(this.concurrency, (job) => this.process(job));
      this.running = true;
    }

    return this.out[Symbol.asyncIterator]();
  }
}
