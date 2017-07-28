export enum Operator {
  And,
  Or
}

export enum Occurrence {
  Must = 0,
  Should = 1,
  MustNot = 2,
  Filter = 3
}

export enum SortOrder {
  Ascending = 0,
  Descending = 1
}

export enum SortMode {
  Min,
  Max,
  Sum,
  Average,
  Median
}

export interface ISerializable {
  getSerializedObj(): any;
  deserialize(obj: any): ISerializable;
}

export interface IQueryBuildable {
  buildQuery(): {};
}

export type SerializedQuery = {
  matches: {
    occurrence: Occurrence,
    serializedMatch: any
  }[],
  sorts: ISort[],
  index: string,
  type: string,
  skip: number,
  limit: number
};

export interface ISort {
  field: string;
  order: SortOrder;
  mode: SortMode;
}

export const Field = {
  Channel: 'channel',
  Topic: 'topic',
  Title: 'title',
  Timestamp: 'timestamp',
  Duration: 'duration',
  Size: 'size',
  Description: 'description',
  Website: 'website'
}
