import { Stream } from 'stream';
import { Nullable } from '../../utils';

export interface IListing {
  getListings(recursive?: boolean): Promise<IListing[]>;
  getFiles(recursive?: boolean): Promise<IFile[]>;
}

export interface IFile {
  ressource: string;
  cacheable: boolean;
  name: string;
  getTimestamp(): Promise<Nullable<number>>;
  getSize(): Promise<Nullable<number>>;
  getStream(): Stream;
}
