import { Entity } from '../common/models';

export type KeyValueBag<T> = Entity & {
  scope: string,
  data: Partial<T>
};
