import { Readable } from 'stream';
import { FileMetadata } from './metadata';

export interface File extends FileMetadata {
    getStream(): Readable;
}