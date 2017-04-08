import { Query, QueryResponse } from '../model';

export interface ISearchEngine {
    query(query: Query): Promise<QueryResponse>;
}
