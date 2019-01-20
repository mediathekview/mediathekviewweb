import { StringMap } from '../../common/types';

export type Entry<T extends StringMap> = {
  id: string,
  data: T
};
