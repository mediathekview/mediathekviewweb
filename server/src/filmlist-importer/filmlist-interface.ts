import { Readable } from 'stream';
import { Nullable } from '../common/utils';

export interface Filmlist {
  ressource: string;
  getStream(): Readable;
  getTimestamp(): Promise<Nullable<number>>;
}
