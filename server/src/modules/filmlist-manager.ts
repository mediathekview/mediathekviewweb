import { AsyncEnumerable } from '@tstdl/base/enumerable';
import { Logger } from '@tstdl/base/logger';
import { AnyIterable, currentTimestamp } from '@tstdl/base/utils';
import { CancellationToken } from '@tstdl/base/utils/cancellation-token';
import { DistributedLoopProvider } from '@tstdl/server/distributed-loop';
import { Module, ModuleBase, ModuleMetric } from '@tstdl/server/module';
import { config } from '../config';
import { FilmlistProvider } from '../entry-source/filmlist/filmlist-provider';
import { keys } from '../keys';
import { FilmlistImportWithPartialId } from '../models';
import { FilmlistImportRepository } from '../repositories/filmlist-import-repository';
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
  private readonly filmlistRepository: FilmlistProvider;
  private readonly distributedLoopProvider: DistributedLoopProvider;
  private readonly logger: Logger;

  constructor(filmlistImportRepository: FilmlistImportRepository, filmlistRepository: FilmlistProvider, distributedLoopProvider: DistributedLoopProvider, logger: Logger) {
    super('FilmlistManager');

    this.filmlistImportRepository = filmlistImportRepository;
    this.filmlistRepository = filmlistRepository;
    this.distributedLoopProvider = distributedLoopProvider;
    this.logger = logger;
  }

  getMetrics(): ModuleMetric[] {
    return [];
  }

  protected async _run(_cancellationToken: CancellationToken): Promise<void> {
    const distributedLoop = this.distributedLoopProvider.get(keys.FilmlistManagerLoop);

    const loopController = distributedLoop.run(async () => this.check(), 60000, 10000);
    await this.cancellationToken; // tslint:disable-line: await-promise

    await loopController.stop();
  }

  private async check(): Promise<void> {
    await this.compareTime('lastLatestCheck', LATEST_CHECK_INTERVAL, async () => await this.checkLatest());
    await this.compareTime('lastArchiveCheck', ARCHIVE_CHECK_INTERVAL, async () => await this.checkArchive());
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

  private async checkLatest(): Promise<void> {
    this.logger.verbose('checking for new current-filmlist');
    const filmlist = await this.filmlistRepository.getLatest();
    await this.enqueueMissingFilmlists([filmlist], 0);
  }

  private async checkArchive(): Promise<void> {
    this.logger.verbose('checking for new archive-filmlist');

    const minimumTimestamp = currentTimestamp() - MAX_AGE_MILLISECONDS;

    const archive = this.filmlistRepository.getArchive();
    await this.enqueueMissingFilmlists(archive, minimumTimestamp);
  }

  private async enqueueMissingFilmlists(filmlists: AnyIterable<Filmlist>, minimumTimestamp: number): Promise<void> {
    const filmlistsEnumerable = new AsyncEnumerable(filmlists);

    await filmlistsEnumerable
      .while(() => !this.cancellationToken.isSet)
      .filter((filmlist) => filmlist.timestamp >= minimumTimestamp)
      .filter(async (filmlist) => !(await this.filmlistImportRepository.hasFilmlist(filmlist.id)))
      .forEach(async (filmlist) => await this.enqueueFilmlist(filmlist));
  }

  private async enqueueFilmlist(filmlist: Filmlist): Promise<void> {
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

    await this.importQueue.enqueue(filmlistImportQueueItem);
  }
}
