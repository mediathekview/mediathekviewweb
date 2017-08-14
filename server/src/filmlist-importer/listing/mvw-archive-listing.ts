import { Stream } from 'stream';
import { IListing, IFile, HttpFile, NginxListing, MVWArchiveFile } from './';
import { Nullable } from '../../utils';
import * as Needle from 'needle';

const URL = 'https://archiv.mediathekviewweb.de/';

export class MVWArchiveListing extends NginxListing {
  constructor() {
    super(URL);
  }

  async getFiles(recursive?: boolean): Promise<IFile[]> {
    let httpFiles: IFile[] = await super.getFiles(recursive);

    return httpFiles
      .filter((httpFile) => !httpFile.ressource.endsWith('Filmliste-diff.xz'))
      .map((httpFile) => new MVWArchiveFile(httpFile));
  }
}
