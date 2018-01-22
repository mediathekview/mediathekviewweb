import { Ressource } from './ressource';
import { File } from './file';
import { HttpFile } from './generic/index';
import { RessourceType } from './index';
import { FileMetadata } from './metadata';

export class FileProvider {
  static get(metadata: FileMetadata): File {
    if (metadata instanceof HttpFile) {
      return metadata;
    }

    switch (metadata.ressource.type) {
      case RessourceType.Http:
        return new HttpFile(metadata);

      default:
        throw new Error('ressource type not supported');
    }
  }
}
