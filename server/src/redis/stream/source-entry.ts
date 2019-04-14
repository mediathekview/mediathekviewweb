import { StringMap } from "@common-ts/base/types";

export type SourceEntry<T extends StringMap> = {
  id?: string;
  data: T;
};
