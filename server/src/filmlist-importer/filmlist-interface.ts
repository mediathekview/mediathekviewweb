import { Readable } from 'stream';
import { Nullable } from '../utils';

export interface IFilmlist {
  ressource: string;
  getStream(): Readable;
  getTimestamp(): Promise<Nullable<number>>;
}
