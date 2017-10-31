import { Stream } from 'stream';
import { File, HttpFile, NginxListing, MVWArchiveFile } from './';
import { Nullable } from '../../common/utils';
import * as Needle from 'needle';

const URL = 'https://archiv.mediathekviewweb.de/';

export class MVWArchiveListing extends NginxListing {
  constructor() {
    super(URL);
  }

  async getFiles(recursive?: boolean): Promise<File[]> {
    let httpFiles: File[] = await super.getFiles(recursive);

    return httpFiles
      .filter((httpFile) => !httpFile.ressource.endsWith('Filmliste-diff.xz'))
      .map((httpFile) => new MVWArchiveFile(httpFile));
  }
}
