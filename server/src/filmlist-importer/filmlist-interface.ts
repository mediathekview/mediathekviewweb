import { Stream } from 'stream';
import { Nullable } from '../utils';

export interface IFilmlist {
  ressource: string;
  getStream(): Stream;
  getTimestamp(): Promise<Nullable<number>>;
}
