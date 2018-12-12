export type SourceEntry<T extends StringMap> = {
  id?: string,
  data: T
};

export type Entry<T extends StringMap> = {
  id: string,
  data: T
};
