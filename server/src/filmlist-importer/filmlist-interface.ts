import { Readable } from 'stream';
import { Nullable } from '../common/utils';

export interface IFilmlist {
  ressource: string;
  getStream(): Readable;
  getTimestamp(): Promise<Nullable<number>>;
}
