export enum SortOrder {
  Ascending,
  Descending
}

export type QueryOptions = { sort?: { field: string, order: SortOrder } };

export enum ErrorType {
  NoConnection,
  Unknown
}

export interface QueryError {
  message: string;
  type: ErrorType;
}

export interface QueryResponse<T> {
  error?: QueryError;
  items: T[];
  queryInfo: QueryInfo;
}

export interface QueryInfo {
  time: number; //time required for query in microseconds
  totalResults: number; //as paging (Query.offset, Query.size) does not return all
}
