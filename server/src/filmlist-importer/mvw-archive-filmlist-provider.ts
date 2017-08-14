import { IFilmlist } from './filmlist-interface';
import { IFilmlisteProvider } from './filmliste-provider-interface';
import { IListing, IFile, MVWArchiveListing } from './listing';
import { HttpFilmlist } from './http-filmlist';
import * as Needle from 'needle';
import { CacheManager } from './cache-manager';
import Config from '../config';
import * as Async from 'async';

export class MVWArchiveFilmlistProvider implements IFilmlisteProvider {
  private listing: IListing = new MVWArchiveListing();

  constructor() {
  }

  async getAll(): Promise<IFilmlist[]> {
    const files = (await this.listing.getFiles(true)).filter((file) => !file.name.endsWith('Filmliste-akt.xz'));
    return files.map((file) => new HttpFilmlist(file.ressource, null, true));
  }

  async getRange(fromTimestamp: number | null, toTimestamp: number | null): Promise<IFilmlist[]> {
    const allFilmlists = await this.getAll();

    const filtered: IFilmlist[] = [];

    for (let filmlist of allFilmlists) {
      let timestamp = await filmlist.getTimestamp();

      if (timestamp != null
        && (fromTimestamp != null && timestamp >= fromTimestamp)
        && (toTimestamp != null && timestamp < toTimestamp)) {
        filtered.push(filmlist);
      }
    }

    return filtered;
  }

  async getLatest(): Promise<IFilmlist> {
    return new HttpFilmlist('https://archiv.mediathekviewweb.de/Filmliste-akt.xz', null, true);
  }
}
