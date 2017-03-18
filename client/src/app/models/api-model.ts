import * as DataModel from './data-model';
import * as QueryModel from './query-model'

export interface IMediathekViewWebAPI {
  query(query: QueryModel.Query): Promise<QueryResponse>;
  getServerState(): Promise<GetServerStateResponse>;
}

export interface IAPIResponse {
  error?: Error;
}

export interface QueryResponse extends IAPIResponse {
  entries: DataModel.Entry[];
  queryInfo: QueryInfo;
}

export interface QueryInfo {
  time: number; //time required for query in milliseconds
  totalResults: number; //as paging (Query.offset, Query.size) does not return all..
}

export interface GetServerStateResponse extends IAPIResponse {

}
