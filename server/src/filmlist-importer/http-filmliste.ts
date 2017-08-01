import { IFilmlist } from './filmlist-interface';
import * as Needle from 'needle';
import * as LZMA from 'lzma-native';
import * as Stream from 'stream';

export class HttpFilmlist implements IFilmlist {
  private url: string;
  private compressed: boolean | null = null;

  constructor(url: string, compressed?: boolean) {
    this.url = url;

    if (typeof compressed == 'boolean') {
      this.compressed == compressed;
    }
  }

  async getStream(): Promise<Stream.Stream> {
    return Needle.get(this.url);
  }

  async getTimestamp(): Promise<number> {
    return -1;
  }
}
