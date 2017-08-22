export enum Occurrence {
  Must = 0,
  Should = 1,
  MustNot = 2,
  Filter = 3
}

export enum Operator {
  And,
  Or
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
  Median,
  Length
}

export type Sort = {
  field: string;
  order: SortOrder;
  mode: SortMode;
}

export type Match = {
  fields: string[];
  range?: {
    lt?: number,
    lte?: number,
    gt?: number,
    gte?: number
  }
  text?: string;
  keyword?: string;
  ids?: string[];
}

export type Query = {
  sorts: Sort[],
  skip: number,
  limit: number
}


export type SerializedQuery = {
  matches: {
    occurrence: Occurrence,
    serializedMatch: any
  }[],
}
