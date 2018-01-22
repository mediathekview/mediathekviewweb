import { File } from './file';

export interface Directory {
    name: string;
    date: Date;

    getFiles(): AsyncIterable<File>;
    getFiles(recursive: boolean): AsyncIterable<File>;
    getDirectories(): AsyncIterable<Directory>;
    getDirectories(recursive: boolean): AsyncIterable<Directory>;
}
