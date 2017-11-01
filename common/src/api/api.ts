import { QueryObject, SearchEngineSearchResult } from '../search-engine';
import { Entry } from '../model';

export { QueryObject, SearchEngineSearchResult, Entry };

export type APIError = { name?: string, message?: string, stack?: string };
export type APIResponse<T> = { result?: T, error?: APIError };

export interface MediathekViewWebAPI {
  search(query: QueryObject): Promise<SearchEngineSearchResult<Entry>>;
}
