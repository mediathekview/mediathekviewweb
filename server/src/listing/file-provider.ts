import { File } from './file';
import { HttpFile } from './generic/index';
import { ResourceType } from './index';
import { FileMetadata } from './metadata';

export class FileProvider {
  static get(metadata: FileMetadata): File {
    if (metadata instanceof HttpFile) {
      return metadata;
    }

    switch (metadata.resource.type) {
      case ResourceType.Http:
        return new HttpFile(metadata);

      default:
        throw new Error('resource type not supported');
    }
  }
}
