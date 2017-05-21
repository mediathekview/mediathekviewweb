import { Readable } from 'stream';

export interface IFilmliste {
  getTimestamp(): Promise<number>;
  getEntries(): Promise<Readable>;
  pipe<T>(destination: T, options?: { end?: boolean }): T
  streamIsCompressed: Promise<boolean>;
}
