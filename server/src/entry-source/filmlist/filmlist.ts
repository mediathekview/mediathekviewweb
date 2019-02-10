import { Entry } from '../../common/model';
import { Serializable } from '../../common/serializer';
import { cloneOwnProperties } from '../../common/utils';
import { FileMetadata, FileProvider } from '../../listing/';
import { decompress } from '../../utils';
import { FilmlistParser } from './parser';

export class Filmlist implements AsyncIterable<Entry[]>, Serializable {
  fileMetadata: FileMetadata;
  compressed: boolean;
  date: Date;

  static deserialize(data: Partial<Filmlist>): Filmlist {
    return new Filmlist(data.fileMetadata as FileMetadata, data.compressed as boolean, data.date as Date);
  }

  constructor(fileMetadata: FileMetadata, compressed: boolean, date: Date) {
    this.fileMetadata = cloneOwnProperties(fileMetadata);
    this.compressed = compressed;
    this.date = date;
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<Entry[]> {
    const file = FileProvider.get(this.fileMetadata);
    let stream = file.getStream();

    if (this.compressed) {
      stream = decompress(stream);
    }

    const parser = new FilmlistParser(stream);
    return parser[Symbol.asyncIterator]();
  }

  serialize(): Partial<Filmlist> {
    const metadata: Partial<Filmlist> = {
      fileMetadata: this.fileMetadata,
      compressed: this.compressed,
      date: this.date
    }

    return metadata;
  }
}
