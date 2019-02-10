import { Resource } from './resource';

export type FileMetadata = {
  resource: Resource;
  name: string;
  size: number;
  date: Date;
};
