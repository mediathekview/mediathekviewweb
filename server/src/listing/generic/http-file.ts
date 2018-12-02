import { Readable } from 'stream';
import { HttpClient } from '../../http';
import { File } from '../file';
import { FileMetadata } from '../metadata';
import { Resource } from '../resource';

export class HttpFile implements File {
  resource: Resource;
  name: string;
  size: number;
  date: Date;

  constructor(metadata: FileMetadata) {
    this.resource = metadata.resource;
    this.name = metadata.name;
    this.size = metadata.size;
    this.date = metadata.date;
  }

  getStream(): Readable {
    return HttpClient.getStream(this.resource.uri);
  }
}
