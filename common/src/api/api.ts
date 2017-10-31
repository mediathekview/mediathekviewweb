import { QueryObject, SearchEngineSearchResult } from '../search-engine';
import { Entry } from '../model';

export { QueryObject, SearchEngineSearchResult, Entry };

export interface MediathekViewWebAPI {
  search(query: QueryObject): Promise<SearchEngineSearchResult<Entry>>;
}
