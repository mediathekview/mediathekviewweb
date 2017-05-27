import { Query, Entry } from './';

export interface IMediathekViewWebAPI {
  query(query: Query): Promise<QueryResponse>;
  getServerState(): Promise<GetServerStateResponse>;
}

export interface IAPIResponse {
  error?: Error;
}

export interface QueryResponse extends IAPIResponse {
  entries: Entry[];
  queryInfo: QueryInfo;
}

export interface QueryInfo {
  time: number; //time required for query in milliseconds
  totalResults: number; //as paging (Query.offset, Query.size) does not return all
}

export interface GetServerStateResponse extends IAPIResponse {

}
