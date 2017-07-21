import { IQuery, IEntry } from './';

export interface IQueryResponse<T> {

}

export interface IMediathekViewWebAPI {
  query(query: Query): Promise<IQueryResponse<Entry>>;
  getServerState(): Promise<GetServerStateResponse>;
}

export interface IAPIResponse {
  error?: Error;
}

export interface GetServerStateResponse extends IAPIResponse {

}
