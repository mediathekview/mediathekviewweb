import { IFilmlisteArchive, IFilmliste } from './interfaces/';
import { NGINXListing } from './nginx-listing';
import { MVWArchiveFilmliste } from './mvw-archive-filmliste';
import { HTTPFilmliste } from './http-filmliste';

const ARCHIVE_URL: string = 'https://archiv.mediathekviewweb.de';
const LATEST_URL: string = 'https://archiv.mediathekviewweb.de/Filmliste-akt.xz';

export class MVWFilmlisteArchive implements IFilmlisteArchive {
  nginxListing: NGINXListing = new NGINXListing();

  async getEntries(): Promise<IFilmliste[]> {
    let listings = await this.nginxListing.getAllFiles(ARCHIVE_URL, true);

    let filmlists: HTTPFilmliste[] = [];

    for (let i = 0; i < listings.length; i++) {
      if (listings[i].url.endsWith('Filmliste-akt.xz')) {
        continue;
      }

      let httpFilmliste = new MVWArchiveFilmliste(listings[i].url);

      filmlists.push(httpFilmliste);
    }

    filmlists.push(new HTTPFilmliste(LATEST_URL));

    return filmlists;
  }

  async getLatest(): Promise<IFilmliste> {
    return new HTTPFilmliste(LATEST_URL);
  }
}
