import { StringMap } from "@tstdl/base/types";

export type SourceEntry<T extends StringMap> = {
  id?: string;
  data: T;
};
