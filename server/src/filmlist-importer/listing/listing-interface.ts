import { Readable } from 'stream';
import { Nullable } from '../../common/utils';

export interface Listing {
  getListings(recursive?: boolean): Promise<Listing[]>;
  getFiles(recursive?: boolean): Promise<File[]>;
}

export interface File {
  ressource: string;
  cacheable: boolean;
  name: string;
  getTimestamp(): Promise<Nullable<number>>;
  getSize(): Promise<Nullable<number>>;
  getStream(): Readable;
}
