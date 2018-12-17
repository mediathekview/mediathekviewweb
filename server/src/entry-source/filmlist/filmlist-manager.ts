import { AsyncEnumerable } from '../../common/enumerable';
import { Logger } from '../../common/logger';
import { now } from '../../common/utils';
import { config } from '../../config';
import { DatastoreFactory, DataType, Key, Set } from '../../datastore';
import { DistributedLoop, DistributedLoopProvider } from '../../distributed-loop';
import { Keys } from '../../keys';
import { Queue, QueueProvider } from '../../queue';
import { Filmlist } from './filmlist';
import { FilmlistRepository } from './repository';
import { LoopController } from '../../distributed-loop/controller';

const LATEST_CHECK_INTERVAL = config.importer.latestCheckInterval * 1000;
const ARCHIVE_CHECK_INTERVAL = config.importer.archiveCheckInterval * 1000;
const MAX_AGE_DAYS = config.importer.archiveRange;

export class FilmlistManager {
  private readonly filmlistRepository: FilmlistRepository;
  private readonly importedFilmlistDates: Set<Date>;
  private readonly lastLatestCheck: Key<Date>;
  private readonly lastArchiveCheck: Key<Date>;
  private readonly importQueue: Queue<Filmlist>;
  private readonly distributedLoop: DistributedLoop;
  private readonly logger: Logger;

  private loopController: LoopController;

  constructor(datastoreFactory: DatastoreFactory, filmlistRepository: FilmlistRepository, distributedLoopProvider: DistributedLoopProvider, queueProvider: QueueProvider, logger: Logger) {
    this.filmlistRepository = filmlistRepository;
    this.logger = logger;

    this.lastLatestCheck = datastoreFactory.key(Keys.LastLatestCheck, DataType.Date);
    this.lastArchiveCheck = datastoreFactory.key(Keys.LastArchiveCheck, DataType.Date);
    this.importedFilmlistDates = datastoreFactory.set(Keys.ImportedFilmlistDates, DataType.Date);
    this.importQueue = queueProvider.get(Keys.FilmlistImportQueue, 5 * 60 * 1000);
    this.distributedLoop = distributedLoopProvider.get(Keys.FilmlistManagerLoop, true);
  }

  run() {
    this.loopController = this.distributedLoop.run(() => this.loop(), 60000, 10000);
  }

  async stop(): Promise<void> {
    await this.loopController.stop();
  }

  private async loop(): Promise<void> {
    await this.compareTime(this.lastLatestCheck, LATEST_CHECK_INTERVAL, () => this.checkLatest());
    await this.compareTime(this.lastArchiveCheck, ARCHIVE_CHECK_INTERVAL, () => this.checkArchive());
  }

  private async compareTime(dateKey: Key<Date>, interval: number, func: () => Promise<void>): Promise<void> {
    let date = await dateKey.get();

    if (date == undefined) {
      date = new Date(0);
    }

    const difference = Date.now() - date.valueOf();

    if (difference >= interval) {
      await func();
      await dateKey.set(now());
    }
  }

  private async checkLatest() {
    this.logger.info('checking for new current-filmlist');
    const filmlist = await this.filmlistRepository.getLatest();
    await this.checkFilmlist(filmlist);
  }

  private async checkArchive(): Promise<void> {
    this.logger.info('checking for new archive-filmlist');

    const minimumDate = now();
    minimumDate.setDate(minimumDate.getDate() - MAX_AGE_DAYS);

    const archiveIterable = this.filmlistRepository.getArchive();
    const filmlists = new AsyncEnumerable(archiveIterable);

    await filmlists
      .filter((filmlist) => filmlist.date >= minimumDate)
      .parallelForEach(3, (filmlist) => this.checkFilmlist(filmlist));
  }

  private async checkFilmlist(filmlist: Filmlist): Promise<void> {
    const imported = await this.importedFilmlistDates.has(filmlist.date);

    if (!imported) {
      await this.enqueueFilmlistImport(filmlist);
    }
  }

  private async enqueueFilmlistImport(filmlist: Filmlist): Promise<void> {
    const timestamp = filmlist.date.valueOf();
    const id = filmlist.fileMetadata.resource.uri + timestamp;
    const priority = Number.MAX_SAFE_INTEGER - filmlist.date.valueOf();

    throw new Error('check if already enqueued');
    //   await this.importQueue.enqueue(filmlist, { jobID: id, priority: priority });
  }
}
