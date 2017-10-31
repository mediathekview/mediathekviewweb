import * as LZMA from 'lzma-native';
import { Readable, Duplex } from 'stream';
import { Filmlist } from './filmlist-interface';
import { File } from './listing';

export class ListingFilmlist implements Filmlist {
  ressource: string;

  constructor(private listingFile: File) {
    this.ressource = listingFile.ressource;
  }

  getStream(): Readable {
    const fileStream = this.listingFile.getStream();

    if (this.listingFile.name.endsWith('.xz')) {
      const decompressor = LZMA.createDecompressor() as Duplex;
      return fileStream.pipe(decompressor);
    }

    return fileStream;
  }

  async getTimestamp(): Promise<number> {
    const timestamp = await this.listingFile.getTimestamp();

    if (timestamp == null) {
      throw new Error('timestamp of null not allowed');
    }

    return timestamp;
  }
}
