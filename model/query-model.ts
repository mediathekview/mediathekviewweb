export interface Query {
  matches?: Match[] | Match;
  filters?: IFilter[] | IFilter;
  sortField?: SortField;
  sortOrder?: SortOrder;
  offset?: number;
  size?: number;
}

export interface Match {
  fields: string[] | string;
  text: string;
}

export interface IFilter {
}

export interface RangeFilter extends IFilter {
  gte?: number;
  gt?: number;
  lte?: number;
  lt?: number;
}

export enum SortOrder {
  Ascending,
  Descending
}

export enum SortField {
  Channel,
  Topic,
  Title,
  Timestamp,
  Duration,
  Size,
  Description
}
