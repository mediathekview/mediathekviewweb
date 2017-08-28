import { IFilmlist } from './filmlist-interface';
import { Nullable } from '../common/utils';
import { getLastModifiedHeaderTimestamp } from '../utils';
import * as Needle from 'needle';
import * as LZMA from 'lzma-native';
import { Stream, Duplex, Readable } from 'stream';

export class HttpFilmlist implements IFilmlist {
  private timestamp: Promise<Nullable<number>> | null = null;
  private compressed: boolean;

  ressource: string;

  constructor(url: string, timestamp: number | null = null, compressed?: boolean) {
    this.ressource = url;

    if (timestamp != null) {
      this.timestamp = Promise.resolve(timestamp);
    }

    if (typeof compressed == 'boolean') {
      this.compressed = compressed;
    } else {
      this.compressed = this.ressource.endsWith('xz');
    }
  }

  getStream(): Readable {
    const httpStream = Needle.get(this.ressource);

    if (this.compressed) {
      const decompressor = LZMA.createDecompressor() as Duplex;
      return httpStream.pipe(decompressor);
    }

    const duplex = new Duplex();
    return httpStream.pipe(duplex);
  }

  async getTimestamp(): Promise<Nullable<number>> {
    if (this.timestamp == null) {
      this.timestamp = getLastModifiedHeaderTimestamp(this.ressource);
    }

    return this.timestamp;
  }
}
