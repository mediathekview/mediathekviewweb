import { Query, SearchEngineSearchResult } from '../search-engine';
import { Entry } from '../model';

export { Query, SearchEngineSearchResult };

export interface MediathekViewWebAPI {
  search(query: Query): Promise<SearchEngineSearchResult<Entry>>;
}
