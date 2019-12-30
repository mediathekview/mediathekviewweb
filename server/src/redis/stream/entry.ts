import { StringMap } from '@tstdl/base/types';

export type Entry<T extends StringMap> = {
  id: string,
  data: T
};
