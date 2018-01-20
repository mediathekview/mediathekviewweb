import { Keys } from '../../keys';
import config from '../../config';
import { FilmlistRepository } from './repository';
import { Set, Key, DatastoreProvider, DataType } from '../../datastore';
import { DistributedLoop, DistributedLoopProvider } from '../../distributed-loop';
import { QueueProvider, Queue } from '../../queue';
import { random, now } from '../../common/utils/index';
import { Filmlist } from './filmlist';
import { AsyncEnumerable } from '../../common/enumerable/index';

const LATEST_CHECK_INTERVAL = config.importer.latestCheckInterval * 1000;
const ARCHIVE_CHECK_INTERVAL = config.importer.archiveCheckInterval * 1000;
const MAX_AGE_DAYS = config.importer.archiveRange;

export class FilmlistManager {
  private filmlistRepository: FilmlistRepository;
  private importedFilmlistDates: Set<Date>;
  private lastLatestCheck: Key<Date>;
  private lastArchiveCheck: Key<Date>;
  private importQueue: Queue<Filmlist>;
  private distributedLoop: DistributedLoop;

  constructor(datastoreProvider: DatastoreProvider, filmlistRepository: FilmlistRepository, distributedLoopProvider: DistributedLoopProvider, queueProvider: QueueProvider) {
    this.filmlistRepository = filmlistRepository;

    this.lastLatestCheck = datastoreProvider.key(Keys.LastLatestCheck, DataType.Date);
    this.lastArchiveCheck = datastoreProvider.key(Keys.LastArchiveCheck, DataType.Date);
    this.importedFilmlistDates = datastoreProvider.set(Keys.ImportedFilmlistDates, DataType.Date);
    this.importQueue = queueProvider.get(Keys.FilmlistImportQueue);
    this.distributedLoop = distributedLoopProvider.get(Keys.FilmlistManagerLoop, true);
  }

  run() {
    const loopController = this.distributedLoop.run(() => this.loop(), 60000, 10000);
  }

  private async loop(): Promise<void> {
    await this.importQueue.clean();

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
    const filmlist = await this.filmlistRepository.getLatest();
    await this.checkFilmlist(filmlist);
  }

  private async checkArchive(): Promise<void> {
    const minimumDate = now();
    minimumDate.setDate(minimumDate.getDate() - MAX_AGE_DAYS);

    const filmlists = new AsyncEnumerable(this.filmlistRepository.getArchive());

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
    const id = filmlist.fileMetadata.ressource.uri + timestamp;
    const priority = Number.MAX_SAFE_INTEGER - filmlist.date.valueOf();

    await this.importQueue.enqueue(filmlist, { jobID: id, priority: priority });
  }
}
