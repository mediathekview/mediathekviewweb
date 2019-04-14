import { StringMap } from '@common-ts/base/types';

export type Entry<T extends StringMap> = {
  id: string,
  data: T
};
