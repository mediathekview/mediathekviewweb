import { IDatastoreProvider, IKey, ISet } from '../data-store';
import { IFilmlist } from './filmlist-interface';
import { IFilmlistProvider } from './filmlist-provider-interface';
import { DatastoreKeys } from '../data-store-keys';
import config from '../config';
import { random } from '../utils';
import * as Bull from 'bull';
import { ILockProvider, ILock } from '../lock';
import { QueueProvider, ImportQueueType } from '../queue';

const LATEST_CHECK_INTERVAL = config.importer.latestCheckInterval * 1000;
const FULL_CHECK_INTERVAL = config.importer.fullCheckTimeout * 1000;
const MAX_AGE_DAYS = config.importer.archiveRange;

export class FilmlistManager {
  private lastCheckTimestamp: IKey<number>;
  private importedFilmlistTimestamps: ISet<number>;
  private importQueue: Bull.Queue;
  private loopLock: ILock;

  constructor(private datastoreProvider: IDatastoreProvider, private filmlistProvider: IFilmlistProvider, private lockProvider: ILockProvider, private queueProvider: QueueProvider) {
    this.lastCheckTimestamp = datastoreProvider.getKey(DatastoreKeys.LastCheckTimestamp);
    this.importedFilmlistTimestamps = datastoreProvider.getSet(DatastoreKeys.ImportedFilmlistTimestamps);
    this.importQueue = queueProvider.getImportQueue();

    this.loopLock = lockProvider.getLock('manager:loop');
  }

  run() {
    setTimeout(() => this.loop(), random(0, 5000));
  }

  private dispatchLoop() {
    setTimeout(() => this.loop(), random(5000, 15000));
  }

  private async loop() {
    try {
      const hasLock = await this.loopLock.lock();

      if (!hasLock) {
        return this.dispatchLoop();
      }

      await this.importQueue.clean(0, 'completed');

      let lastCheckTimestamp = await this.lastCheckTimestamp.get();

      if (lastCheckTimestamp == null) {
        lastCheckTimestamp = 0;
      }

      const difference = Date.now() - lastCheckTimestamp;

      if (difference >= LATEST_CHECK_INTERVAL) {
        await this.checkLatest();
      }

      if (difference >= FULL_CHECK_INTERVAL) {
        await this.checkFull();
      }

      await this.lastCheckTimestamp.set(Date.now());

      this.loopLock.unlock();

      this.dispatchLoop();
    }
    catch (error) {
      await this.loopLock.unlock();

      throw error;
    }
  }

  private async checkLatest() {
    const filmlist = await this.filmlistProvider.getLatest();

    await this.checkFilmlist(filmlist);
  }

  private async checkFull() {
    const date = new Date();
    const toTimestamp = Math.floor(date.getTime() / 1000);
    const fromTimestamp = Math.floor(date.setDate(date.getDate() - MAX_AGE_DAYS) / 1000);

    const filmlists = await this.filmlistProvider.getRange(fromTimestamp, toTimestamp);

    for (let filmlist of filmlists) {
      await this.checkFilmlist(filmlist);
    }
  }

  private async checkFilmlist(filmlist: IFilmlist) {
    const timestamp = await filmlist.getTimestamp();

    if (timestamp == null) {
      throw new Error('timestamp of filmlist should not be null');
    }

    const filmlistImported = await this.importedFilmlistTimestamps.has(timestamp);
    console.log(timestamp, filmlistImported);

    if (!filmlistImported) {
      await this.enqueueFilmlistImport(filmlist.ressource, timestamp);
    }
  }

  private async enqueueFilmlistImport(ressource: string, timestamp: number) {
    const jobData: ImportQueueType = { ressource: ressource, timestamp: timestamp };
    await this.importQueue.add(jobData, { jobId: (ressource + timestamp), priority: Number.MAX_SAFE_INTEGER - timestamp });
  }
}
