import { Stream } from 'stream';

export interface IFilmlist {
  getStream(): Promise<Stream>;
  getTimestamp(): Promise<number>;
}
