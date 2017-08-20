import * as LZMA from 'lzma-native';
import { Readable, Duplex } from 'stream';
import { IFilmlist } from './filmlist-interface';
import { IFile } from './listing';

export class ListingFilmlist implements IFilmlist {
  constructor(private listingFile: IFile) { }

  get ressource(): string {
    return this.listingFile.ressource;
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
