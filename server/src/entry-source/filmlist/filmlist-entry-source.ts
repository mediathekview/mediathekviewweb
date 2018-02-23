import { EntrySource } from '../';
import { Entry } from '../../common/model';
import { FeedableAsyncIterable } from '../../common/utils';
import { DatastoreFactory, DataType, Set } from '../../datastore';
import { Keys } from '../../keys';
import { LoggerFactoryProvider } from '../../logger-factory-provider';
import { Job, Queue, QueueProvider } from '../../queue';
import { Filmlist } from './filmlist';

const logger = LoggerFactoryProvider.factory.create('[FILMLIST_SOURCE]');

export class FilmlistEntrySource implements EntrySource {
  private readonly out: FeedableAsyncIterable<Entry[]>;
  private readonly importQueue: Queue<Filmlist>;
  private readonly importedFilmlistDates: Set<Date>;

  constructor(datastoreFactory: DatastoreFactory, queueProvider: QueueProvider) {
    this.out = new FeedableAsyncIterable();
    this.importQueue = queueProvider.get(Keys.FilmlistImportQueue);
    this.importedFilmlistDates = datastoreFactory.set(Keys.ImportedFilmlistDates, DataType.Date);
  }

  run(): void;
  run(concurrency: number): void;
  run(concurrency: number = 1) {
    this.importQueue.process(concurrency, (job) => this.process(job));
  }

  private async process(job: Job<Filmlist>) {
    let filmlist = job.data;

    logger.info(`${process.pid} processing filmlist ${filmlist.date}`);

    for await (const entry of filmlist) {
      if (this.out.bufferSize > 10) {
        await this.out.empty;
      }

      this.out.feed(entry);
    }

    await this.importedFilmlistDates.add(filmlist.date);
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<Entry[]> {
    return this.out[Symbol.asyncIterator]();
  }
}
