import { Filmlist } from './filmlist-interface';

export interface FilmlistProvider {
  getAll(): Promise<Filmlist[]>;
  getRange(fromTimestamp: number, toTimestamp: number): Promise<Filmlist[]>;
  getLatest(): Promise<Filmlist>;
}
