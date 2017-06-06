import { Readable } from 'stream';
import { Observable } from 'rxjs';
import { Entry } from '../model';

export interface IFilmliste {
  getTimestamp(): Promise<number>;
  getEntries(): Observable<Entry[]>;
  pipe<T>(destination: T, options?: { end?: boolean }): T
  streamIsCompressed: Promise<boolean>;
}
