import { Readable } from 'stream';

export interface IFilmliste {
  getTimestamp(): Promise<number>;
  getEntries(): Promise<Readable>;
}
