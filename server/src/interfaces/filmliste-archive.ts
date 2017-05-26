import { IFilmliste } from './filmliste';

export interface IFilmlisteArchive {
  getAll(): Promise<IFilmliste[]>;
  getRange(timestampBegin: number, timestampEnd: number): Promise<IFilmliste[]>;
  getLatest(): Promise<IFilmliste>;
}
