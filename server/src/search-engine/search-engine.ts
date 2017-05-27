import { Query, QueryResponse, Entry } from '../model';

export interface ISearchEngine {
  query(query: Query): Promise<QueryResponse>;
  index(...entries: Entry[]): Promise<void>;
}
