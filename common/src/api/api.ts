import { Query, SearchEngineSearchResult } from '../search-engine';
import { IEntry } from '../model';

export { Query, SearchEngineSearchResult };

export interface IMediathekViewWebAPI {
  search(query: Query): Promise<SearchEngineSearchResult<IEntry>>;
}
