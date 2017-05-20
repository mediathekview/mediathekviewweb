import { Readable } from 'stream';

export interface IFilmlisteArchive {
  getEntries(): Promise<IFilmliste[]>;
  getLatest(): Promise<IFilmliste>;
}

export interface IFilmliste {
  getTimestamp(): Promise<number>;
  getEntries(): Promise<Readable>;
}
