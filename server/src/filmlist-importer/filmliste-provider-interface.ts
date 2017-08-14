import { IFilmlist } from './filmlist-interface';

export interface IFilmlisteProvider {
  getAll(): Promise<IFilmlist[]>;
  getRange(fromTimestamp: number, toTimestamp: number): Promise<IFilmlist[]>;
  getLatest(): Promise<IFilmlist>;
}
