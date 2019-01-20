import { StringMap } from '../../common/types';

export type SourceEntry<T extends StringMap> = {
  id?: string;
  data: T;
};
