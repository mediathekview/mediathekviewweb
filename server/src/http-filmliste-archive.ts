import { Readable } from 'stream';
import { IFilmlisteArchive, IFilmliste } from './model/filmliste-archive-interface';

const ARCHIVE_URL: string = 'https://archiv.mediathekviewweb.de';


export class HTTPFilmlisteArchive implements IFilmlisteArchive {
  async getEntries(): Promise<IFilmliste[]> {
    throw 'not implemented';
  }

  async getLatest(): Promise<IFilmliste> {
    throw 'not implemented';
  }
}

export class HTTPFilmliste implements IFilmliste {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  getTimestamp(): Promise<number> {
    throw 'not implemented';
  }

  getEntries(): Promise<Readable> {
    throw 'not implemented';
  }
}
