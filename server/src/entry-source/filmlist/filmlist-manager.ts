import { AsyncEnumerable } from '../../common/enumerable';
import { Logger } from '../../common/logger';
import { AnyIterable, now } from '../../common/utils';
import { config } from '../../config';
import { DatastoreFactory, DataType, Key, Set } from '../../datastore';
import { DistributedLoopProvider } from '../../distributed-loop';
import { Keys } from '../../keys';
import { Queue, QueueProvider } from '../../queue';
import { Service, ServiceMetric } from '../../service';
import { ServiceBase } from '../../service-base';
import { Filmlist } from './filmlist';
import { FilmlistRepository } from './repository';

const LATEST_CHECK_INTERVAL = config.importer.latestCheckInterval * 1000;
const ARCHIVE_CHECK_INTERVAL = config.importer.archiveCheckInterval * 1000;
const MAX_AGE_DAYS = config.importer.archiveRange;

export class FilmlistManager extends ServiceBase implements Service {
  private readonly datastoreFactory: DatastoreFactory;
  private readonly filmlistRepository: FilmlistRepository;
  private readonly distributedLoopProvider: DistributedLoopProvider;
  private readonly queueProvider: QueueProvider;
  private readonly logger: Logger;

  get metrics(): ReadonlyArray<ServiceMetric> {
    return [];
  }

  constructor(datastoreFactory: DatastoreFactory, filmlistRepository: FilmlistRepository, distributedLoopProvider: DistributedLoopProvider, queueProvider: QueueProvider, logger: Logger) {
    super();

    this.datastoreFactory = datastoreFactory;
    this.filmlistRepository = filmlistRepository;
    this.distributedLoopProvider = distributedLoopProvider;
    this.queueProvider = queueProvider;
    this.logger = logger;
  }

  protected async run(): Promise<void> {
    const lastLatestCheck = this.datastoreFactory.key<Date>(Keys.LastLatestCheck, DataType.Date);
    const lastArchiveCheck = this.datastoreFactory.key<Date>(Keys.LastArchiveCheck, DataType.Date);
    const enqueuedFilmlistDates = this.datastoreFactory.set<Date>(Keys.EnqueuedFilmlistDates, DataType.Date);
    const importedFilmlistDates = this.datastoreFactory.set<Date>(Keys.ImportedFilmlistDates, DataType.Date);
    const importQueue = this.queueProvider.get<Filmlist>(Keys.FilmlistImportQueue, 5 * 60 * 1000, 3);
    const distributedLoop = this.distributedLoopProvider.get(Keys.FilmlistManagerLoop, true);

    await importQueue.initialize();

    const loopController = distributedLoop.run(async () => await this.loop(lastLatestCheck, lastArchiveCheck, importQueue, importedFilmlistDates, enqueuedFilmlistDates), 60000, 10000);
    await this.cancellationToken; // tslint:disable-line: await-promise

    await Promise.all([
      importQueue.dispose(),
      loopController.stop()
    ]);
  }

  private async loop(lastLatestCheck: Key<Date>, lastArchiveCheck: Key<Date>, importQueue: Queue<Filmlist>, importedFilmlistDates: Set<Date>, enqueuedFilmlistDates: Set<Date>): Promise<void> {
    await this.compareTime(lastLatestCheck, LATEST_CHECK_INTERVAL, async () => await this.checkLatest(importQueue, importedFilmlistDates, enqueuedFilmlistDates));
    await this.compareTime(lastArchiveCheck, ARCHIVE_CHECK_INTERVAL, async () => await this.checkArchive(importQueue, importedFilmlistDates, enqueuedFilmlistDates));
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

  private async checkLatest(importQueue: Queue<Filmlist>, importedFilmlistDates: Set<Date>, enqueuedFilmlistDates: Set<Date>): Promise<void> {
    this.logger.verbose('checking for new current-filmlist');
    const filmlist = await this.filmlistRepository.getLatest();
    await this.enqueueMissingFilmlists([filmlist], undefined, importQueue, importedFilmlistDates, enqueuedFilmlistDates);
  }

  private async checkArchive(importQueue: Queue<Filmlist>, importedFilmlistDates: Set<Date>, enqueuedFilmlistDates: Set<Date>): Promise<void> {
    this.logger.verbose('checking for new archive-filmlist');

    const minimumDate = now();
    minimumDate.setDate(minimumDate.getDate() - MAX_AGE_DAYS);

    const archive = this.filmlistRepository.getArchive();
    await this.enqueueMissingFilmlists(archive, minimumDate, importQueue, importedFilmlistDates, enqueuedFilmlistDates);
  }

  private async enqueueMissingFilmlists(filmlists: AnyIterable<Filmlist>, minimumDate: Date | undefined, importQueue: Queue<Filmlist>, importedFilmlistDates: Set<Date>, enqueuedFilmlistDates: Set<Date>): Promise<void> {
    const filmlistsEnumerable = new AsyncEnumerable(filmlists);

    await filmlistsEnumerable
      .while(() => !this.cancellationToken.isSet)
      .filter((filmlist) => (minimumDate == undefined) || filmlist.date >= minimumDate)
      .filter(async (filmlist) => !(await importedFilmlistDates.has(filmlist.date)))
      .filter(async (filmlist) => !(await enqueuedFilmlistDates.has(filmlist.date)))
      .parallelForEach(3, async (filmlist) => await this.enqueueFilmlist(filmlist, importQueue, enqueuedFilmlistDates));
  }

  private async enqueueFilmlist(filmlist: Filmlist, importQueue: Queue<Filmlist>, enqueuedFilmlistDates: Set<Date>): Promise<void> {
    await importQueue.enqueue(filmlist);
    await enqueuedFilmlistDates.add(filmlist.date);
  }
}
