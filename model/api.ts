import { Query, Entry } from './';
import { QueryResponse } from '../../../search-engine/search-engine';

export interface IMediathekViewWebAPI {
  query(query: Query): Promise<QueryResponse<Entry>>;
  getServerState(): Promise<GetServerStateResponse>;
}

export interface IAPIResponse {
  error?: Error;
}

export interface GetServerStateResponse extends IAPIResponse {

}
