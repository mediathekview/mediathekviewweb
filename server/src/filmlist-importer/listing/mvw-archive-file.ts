import { Readable } from 'stream';
import { IFile, HttpFile } from './';
import { Nullable } from '../../utils';

const TIMESTAMP_REGEX = /\/(\d{4})-0?(\d{1,2})-0?(\d{1,2})-filme\.xz$/;

export class MVWArchiveFile implements IFile {
  cacheable: boolean;
  name:string;
  ressource:string;

  constructor(private file: IFile) {
    if (!file.ressource.startsWith('https://archiv.mediathekviewweb.de/' || !file.ressource.endsWith('.xz'))) {
      throw new Error(`Invalid ressource for MVWArchiveFile: ${file.ressource}`);
    }

    this.cacheable = !file.ressource.endsWith('Filmliste-akt.xz');
    this.name = file.name;
    this.ressource = file.ressource;
  }

  async getTimestamp(): Promise<Nullable<number>> {
    const match = this.file.ressource.match(TIMESTAMP_REGEX);

    if (match != null) {
      return Math.floor(Date.UTC(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3])) / 1000);
    }

    return this.file.getTimestamp();
  }

  getSize(): Promise<Nullable<number>> {
    return this.file.getSize();
  }

  getStream(): Readable {
    return this.file.getStream();
  }
}
