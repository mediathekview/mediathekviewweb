import { ISearchEngine } from '../search-engine';
import { Query, QueryResponse, Entry } from '../../model';

export class RedisSearchEngine implements ISearchEngine {
  query(query: Query): Promise<QueryResponse> {
    return;
  }

  index(...entries: Entry[]): Promise<void> {
    return;
  }
}
