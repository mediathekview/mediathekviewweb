import { Readable } from 'stream';

import { File, FileMetadata } from '../';
import { HttpClient } from '../../http';
import { Ressource } from '../ressource';

export class HttpFile implements File {
    ressource: Ressource;
    name: string;
    size: number;
    date: Date;

    constructor(metadata: FileMetadata) {
        this.ressource = metadata.ressource;
        this.name = metadata.name;
        this.size = metadata.size;
        this.date = metadata.date;
    }

    getStream(): Readable {
        return HttpClient.getStream(this.ressource.uri);
    }
}
