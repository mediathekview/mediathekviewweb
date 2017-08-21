export type SearchEngineEntry<T> = { id: string, document: T };

export interface ISearchEngine<T> {
  index(...entries: SearchEngineEntry<T>[]): Promise<void>;
}
