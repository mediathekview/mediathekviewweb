import { Filmlist } from './filmlist-interface';
import { FilmlistProvider } from './filmlist-provider-interface';
import { Listing, MVWArchiveListing } from './listing';
import { HttpFilmlist } from './http-filmlist';

export class MVWArchiveFilmlistProvider implements FilmlistProvider {
  private listing: Listing = new MVWArchiveListing();

  constructor() {
  }

  async getAll(): Promise<Filmlist[]> {
    const files = (await this.listing.getFiles(true)).filter((file) => !file.name.endsWith('Filmliste-akt.xz'));
    return files;
  }

  async getRange(fromTimestamp: number | null, toTimestamp: number | null): Promise<Filmlist[]> {
    const allFilmlists = await this.getAll();

    const filtered: Filmlist[] = [];

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

  async getLatest(): Promise<Filmlist> {
    return new HttpFilmlist('https://archiv.mediathekviewweb.de/Filmliste-akt.xz', null, true);
  }
}
