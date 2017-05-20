import { IFilmliste } from './filmliste';

export interface IFilmlisteArchive {
  getEntries(): Promise<IFilmliste[]>;
  getLatest(): Promise<IFilmliste>;
}
