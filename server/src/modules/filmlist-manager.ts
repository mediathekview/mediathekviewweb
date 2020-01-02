import { AsyncEnumerable } from '@tstdl/base/enumerable';
import { Logger } from '@tstdl/base/logger';
import { Queue, QueueProvider } from '@tstdl/base/queue';
import { AnyIterable, currentTimestamp, now } from '@tstdl/base/utils';
import { CancellationToken } from '@tstdl/base/utils/cancellation-token';
import { DistributedLoopProvider } from '@tstdl/server/distributed-loop';
import { Module, ModuleBase, ModuleMetric } from '@tstdl/server/module';
import { config } from '../config';
import { FilmlistRepository } from '../entry-source/filmlist/repository';
import { keys } from '../keys';
import { Filmlist } from '../models/filmlist';
import { FilmlistImportQueueItem, FilmlistImportWithPartialId } from '../models/filmlist-import';
import { FilmlistImportRepository } from '../repositories/filmlists-import-repository';
import { KeyValueRepository } from '../repositories/key-value-repository';

const LATEST_CHECK_INTERVAL = config.importer.latestCheckIntervalMinutes * 60 * 1000;
const ARCHIVE_CHECK_INTERVAL = config.importer.archiveCheckIntervalMinutes * 60 * 1000;
const MAX_AGE_DAYS = config.importer.archiveRange;
const MAX_AGE_MILLISECONDS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

type FilmlistManagerKeyValues = {
  lastLatestCheck: number,
  lastArchiveCheck: number,
};

export class FilmlistManagerModule extends ModuleBase implements Module {
  private readonly keyValueRepository: KeyValueRepository<FilmlistManagerKeyValues>;
  private readonly filmlistImportRepository: FilmlistImportRepository;
  private readonly filmlistRepository: FilmlistRepository;
  private readonly distributedLoopProvider: DistributedLoopProvider;
  private readonly queueProvider: QueueProvider;
  private readonly logger: Logger;

  constructor(filmlistImportRepository: FilmlistImportRepository, filmlistRepository: FilmlistRepository, distributedLoopProvider: DistributedLoopProvider, queueProvider: QueueProvider, logger: Logger) {
    super('FilmlistManager');

    this.filmlistImportRepository = filmlistImportRepository;
    this.filmlistRepository = filmlistRepository;
    this.distributedLoopProvider = distributedLoopProvider;
    this.queueProvider = queueProvider;
    this.logger = logger;
  }

  getMetrics(): ModuleMetric[] {
    return [];
  }

  protected async _run(_cancellationToken: CancellationToken): Promise<void> {
    const importQueue = this.queueProvider.get<FilmlistImportQueueItem>(keys.FilmlistImportQueue, 5 * 60 * 1000);
    const distributedLoop = this.distributedLoopProvider.get(keys.FilmlistManagerLoop);

    const loopController = distributedLoop.run(async () => this.check(importQueue), 60000, 10000);
    await this.cancellationToken; // tslint:disable-line: await-promise

    await loopController.stop();
  }

  private async check(importQueue: Queue<FilmlistImportQueueItem>): Promise<void> {
    await this.compareTime('lastLatestCheck', LATEST_CHECK_INTERVAL, async () => await this.checkLatest(importQueue));
    await this.compareTime('lastArchiveCheck', ARCHIVE_CHECK_INTERVAL, async () => await this.checkArchive(importQueue));
  }

  private async compareTime(key: keyof FilmlistManagerKeyValues, interval: number, func: () => Promise<void>): Promise<void> {
    const lastCheck = await this.keyValueRepository.get(key, 0);
    const now = currentTimestamp();
    const difference = now - lastCheck;

    if (difference >= interval) {
      await func();
      await this.keyValueRepository.set(key, now);
    }
  }

  private async checkLatest(importQueue: Queue<FilmlistImportQueueItem>): Promise<void> {
    this.logger.verbose('checking for new current-filmlist');
    const filmlist = await this.filmlistRepository.getLatest();
    await this.enqueueMissingFilmlists([filmlist], 0, importQueue);
  }

  private async checkArchive(importQueue: Queue<FilmlistImportQueueItem>): Promise<void> {
    this.logger.verbose('checking for new archive-filmlist');

    const minimumTimestamp = currentTimestamp() - MAX_AGE_MILLISECONDS;

    const archive = this.filmlistRepository.getArchive();
    await this.enqueueMissingFilmlists(archive, minimumTimestamp, importQueue);
  }

  private async enqueueMissingFilmlists(filmlists: AnyIterable<Filmlist>, minimumTimestamp: number, importQueue: Queue<FilmlistImportQueueItem>): Promise<void> {
    const filmlistsEnumerable = new AsyncEnumerable(filmlists);

    await filmlistsEnumerable
      .while(() => !this.cancellationToken.isSet)
      .filter((filmlist) => filmlist.timestamp >= minimumTimestamp)
      .filter(async (filmlist) => !(await this.filmlistImportRepository.hasFilmlist(filmlist.id)))
      .forEach(async (filmlist) => await this.enqueueFilmlist(filmlist, importQueue));
  }

  private async enqueueFilmlist(filmlist: Filmlist, importQueue: Queue<FilmlistImportQueueItem>): Promise<void> {
    const filmlistImport: FilmlistImportWithPartialId = {
      filmlist,
      enqueuedTimestamp: currentTimestamp(),
      processedTimestamp: null,
      numberOfEntries: null
    };

    const insertedFilmlistImport = await this.filmlistImportRepository.save(filmlistImport);

    const filmlistImportQueueItem: FilmlistImportQueueItem = {
      filmlistImportId: insertedFilmlistImport.id
    };

    await importQueue.enqueue(filmlistImportQueueItem);
  }
}
