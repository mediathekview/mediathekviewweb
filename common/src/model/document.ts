import { Entity } from './entity';

export type Document<T> = Entity & {
  created: Date;
  updated: Date;
  item: T;
}
