import { IDatastoreProvider, IKey, ISet } from '../data-store';
import { IFilmlist } from './filmlist-interface';
import { FilmlistParser } from './filmlist-parser';
import { IFilmlistProvider } from './filmlist-provider-interface';
import config from '../config';
import { random } from '../utils';

const LATEST_CHECK_INTERVAL = config.importer.latestCheckInterval * 1000;
const FULL_CHECK_INTERVAL = config.importer.fullCheckTimeout * 1000;

export class FilmlistManager {
  private lastCheckTimestamp: IKey<number>;
  private importedFilmlistTimestamps: ISet<number>;

  constructor(private datastoreProvider: IDatastoreProvider, private filmlistProvider: IFilmlistProvider) {
    this.lastCheckTimestamp = datastoreProvider.getKey('manager:lastCheckTimestamp');
    this.importedFilmlistTimestamps = datastoreProvider.getSet('manager:importedFilmlistTimestamps');
  }

  run() {
    setTimeout(() => this.loop(), random(0, 5000));
  }

  private async loop() {
    const lastCheckTimestamp = await this.lastCheckTimestamp.get();
    const difference = Date.now() - lastCheckTimestamp;

    await this.lastCheckTimestamp.set(Date.now());

    if (difference >= LATEST_CHECK_INTERVAL) {
      await this.checkLatest();
    }

    if (difference >= FULL_CHECK_INTERVAL) {
      await this.checkFull();
    }

    setTimeout(() => this.loop(), random(5000, 10000));
  }

  private async checkLatest() {
    const filmlist = await this.filmlistProvider.getLatest();
    const timestamp = await filmlist.getTimestamp();

    if (timestamp == null) {
      throw new Error('timestamp should not be null');
    }

    const filmlistImported = await this.importedFilmlistTimestamps.has(timestamp);

    if (!filmlistImported) {

    }
  }

  private async checkFull() {

  }

  private async importFilmlist(filmlist: IFilmlist) {
    let filmlistTimestamp: number;

    const parser = new FilmlistParser(filmlist, (metadata) => filmlistTimestamp = metadata.timestamp);

    for await (const entry of parser.parse()) {
      //put into redis
    }
  }
}
