import { Readable } from 'stream';
import { Observable } from 'rxjs';
import { Entry } from '../model';

export type BatchType = { data: Entry[], next: () => void };

export interface IFilmliste {
  getTimestamp(): Promise<number>;
  getEntries(): Observable<BatchType>;
  pipe<T>(destination: T, options?: { end?: boolean }): Promise<T>;
  streamIsCompressed: Promise<boolean>;
}
