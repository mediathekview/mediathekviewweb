import { IFilmlisteArchive, IFilmliste } from './interfaces/';
import { NGINXListing } from './nginx-listing';
import { HTTPFilmliste } from './http-filmliste';

const ARCHIVE_URL: string = 'https://archiv.mediathekviewweb.de';

export class MVWFilmlisteArchive implements IFilmlisteArchive {
  nginxListing: NGINXListing = new NGINXListing();

  async getEntries(): Promise<IFilmliste[]> {
    let listings = await this.nginxListing.getAllFiles(ARCHIVE_URL, true);

    let filmlists: HTTPFilmliste[] = [];

    for (let i = 0; i < listings.length; i++) {
      let httpFilmliste = new HTTPFilmliste(listings[i].url);

      filmlists.push(new )
    }
  }

  async getLatest(): Promise<IFilmliste> {
    throw 'not implemented';
  }
}
