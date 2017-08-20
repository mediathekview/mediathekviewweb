import { IFilmlist } from './filmlist-interface';
import { Nullable, getLastModifiedHeaderTimestamp } from '../utils';
import * as Needle from 'needle';
import * as LZMA from 'lzma-native';
import { Stream, Duplex, Readable } from 'stream';

export class HttpFilmlist implements IFilmlist {
  private url: string;
  private timestamp: Promise<Nullable<number>> | null = null;
  private compressed: boolean;

  constructor(url: string, timestamp: number | null = null, compressed?: boolean) {
    this.url = url;

    if (timestamp != null) {
      this.timestamp = Promise.resolve(timestamp);
    }

    if (typeof compressed == 'boolean') {
      this.compressed = compressed;
    } else {
      this.compressed = this.url.endsWith('xz');
    }
  }

  get ressource(): string {
    return this.url;
  }

  getStream(): Readable {
    const httpStream = Needle.get(this.url);

    if (this.compressed) {
      const decompressor = LZMA.createDecompressor() as Duplex;
      return httpStream.pipe(decompressor);
    }

    const duplex = new Duplex();
    return httpStream.pipe(duplex);
  }

  async getTimestamp(): Promise<Nullable<number>> {
    if (this.timestamp == null) {
      this.timestamp = getLastModifiedHeaderTimestamp(this.url);
    }

    return this.timestamp;
  }
}
