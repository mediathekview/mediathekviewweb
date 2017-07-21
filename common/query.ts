interface ISerializable {
  getSerializedObj(): any;
  deserialize(obj: any): ISerializable;
}

interface IQueryBuildable {
  buildQuery(): {};
}

export type SerializedQuery = { matches: { occurrence: Occurrence, serializedMatch: any }[], sorts: ISort[], index: string, type: string, skip: number, limit: number };

export class Query implements ISerializable, IQueryBuildable {
  private _index: string;
  private _type: string;
  private _matches: { occurrence: Occurrence, match: IMatch }[] = [];
  private _sorts: ISort[] = [];
  private _skip: number = null;
  private _limit: number = null;

  match(occurrence: Occurrence, match: IMatch): Query {
    this._matches.push({ occurrence: occurrence, match: match });
    return this;
  }

  index(index: string): Query {
    this._index = index;
    return this;
  }

  type(type: string): Query {
    this._type = type;
    return this;
  }

  sort(field: string, order: SortOrder = SortOrder.Ascending, mode: SortMode = null): Query {
    this._sorts.push({ field: field, order: order, mode: mode });
    return this;
  }

  skip(count: number): Query {
    this._skip = count;
    return this;
  }

  limit(count: number): Query {
    this._limit = count;
    return this;
  }

  getSerializedObj(): SerializedQuery {
    let serializedObj: SerializedQuery = { matches: [], sorts: this._sorts, index: this._index, type: this._type, skip: this._skip, limit: this._limit };

    serializedObj.matches = this._matches.map((match) => {
      return { occurrence: match.occurrence, serializedMatch: match.match.getSerializedObj() };
    });

    return serializedObj;
  }

  deserialize(obj: SerializedQuery): Query {
    this._matches = obj.matches.map((serializedMatch) => {
      let matchObj = { occurrence: serializedMatch.occurrence, match: null };

      let match: IMatch;

      if ('all' in serializedMatch.serializedMatch) {
        match = new AllMatch();
      } else if ('multi' in serializedMatch.serializedMatch) {
        match = new MultiMatch();
      } else if ('range' in serializedMatch.serializedMatch) {
        match = new RangeMatch();
      } else {
        throw new Error('type of match not supported: ' + serializedMatch);
      }

      match.deserialize(serializedMatch.serializedMatch);

      matchObj.match = match;

      return matchObj;
    });

    this._index = obj.index;
    this._type = obj.type;
    this._sorts = obj.sorts;
    this._skip = obj.skip;
    this._limit = obj.limit;

    return this;
  }


  buildQuery(): {} {
    let queryObj = {
      index: this._index,
      type: this._type,
      from: this._skip,
      size: this._limit,
      body: {
        query: {
          bool: {
            must: [],
            filter: [],
            must_not: [],
            should: []
          }
        }
      }
    };

    if (this._skip == null) {
      delete queryObj['from'];
    }

    if (this._limit == null) {
      delete queryObj['size'];
    }

    if (this.sort.length > 0) {
      queryObj['sort'] = [];

      this._sorts.forEach((sort) => {
        let sortEntry = {};
        sortEntry[sort.field] = { order: (sort.order == SortOrder.Ascending) ? 'asc' : 'desc', ignore_unmapped: true  };

        if (sort.mode != null) {
          let mode: string;
          switch (sort.mode) {
            case SortMode.Min:
              mode = 'min';
              break;
            case SortMode.Max:
              mode = 'max';
              break;
            case SortMode.Sum:
              mode = 'sum';
              break;
            case SortMode.Average:
              mode = 'avg';
              break;
            case SortMode.Median:
              mode = 'median';
              break;
          }

          sortEntry[sort.field]['mode'] = mode;
        }

        queryObj['sort'].push(sortEntry);
      });
    }

    this._matches.forEach((match) => {
      switch (match.occurrence) {
        case Occurrence.Must:
          queryObj.body.query.bool.must.push(match.match.buildQuery());
          break;
        case Occurrence.Should:
          queryObj.body.query.bool.should.push(match.match.buildQuery());
          break;
        case Occurrence.MustNot:
          queryObj.body.query.bool.must_not.push(match.match.buildQuery());
          break;
        case Occurrence.Filter:
          queryObj.body.query.bool.filter.push(match.match.buildQuery());
          break;
      }
    });

    for (let key in queryObj.body.query.bool) {
      if (Array.isArray(queryObj.body.query.bool[key]) && queryObj.body.query.bool[key].length == 0) {
        delete queryObj.body.query.bool[key];
      }
    }

    return queryObj;
  }
}

interface ISort {
  field: string;
  order: SortOrder;
  mode: SortMode;
}

interface IMatch extends ISerializable, IQueryBuildable {
}

export class AllMatch implements IMatch {
  constructor() { }

  getSerializedObj(): any {
    return { all: {} };
  }

  canDeserialize(obj: any): boolean {
    return !!obj.hasOwnProperty('all');
  }

  deserialize(obj: any): AllMatch {
    return this;
  }

  buildQuery(): {} {
    return { match_all: {} };
  }
}

export class MultiMatch implements IMatch {
  constructor(private query?: string, private fields?: string[], private options?: { fuzzy?: boolean, operator?: Operator, minimumShouldMatch?: number, minimumShouldMatchPercentage?: number }) { }

  getSerializedObj(): any {
    return { multi: { query: this.query, fields: this.fields, options: this.options } };
  }

  canDeserialize(obj: any): boolean {
    return !!obj.hasOwnProperty('multi');
  }

  deserialize(obj: any): MultiMatch {
    this.query = obj.multi.query;
    this.fields = obj.multi.fields;
    this.options = obj.multi.options;
    return this;
  }

  buildQuery(): {} {
    let queryObj = {
      multi_match: {
        query: this.query,
        type: "cross_fields",
        fields: this.fields,
        operator: (this.options && this.options.operator == Operator.Or) ? 'or' : 'and'
      }
    };


    if (!this.options) {
      return queryObj;
    }

    if (this.options.fuzzy) {
      queryObj.multi_match['fuzziness'] = 'auto';
    }

    if (this.options.minimumShouldMatch && this.options.minimumShouldMatchPercentage) {
      queryObj.multi_match['minimum_should_match'] = this.options.minimumShouldMatch.toString() + '<' + this.options.minimumShouldMatchPercentage.toString() + '%';
    } else if (this.options.minimumShouldMatch) {
      queryObj.multi_match['minimum_should_match'] = this.options.minimumShouldMatch;
    } else if (this.options.minimumShouldMatchPercentage) {
      queryObj.multi_match['minimum_should_match'] = this.options.minimumShouldMatchPercentage.toString() + '%';
    }

    return queryObj;
  }
}

export class RangeMatch implements IMatch {
  constructor(private field?: string, private range?: { lt?: number, lte?: number, gt?: number, gte?: number }) { }

  getSerializedObj(): any {
    return { range: { field: this.field, range: this.range } };
  }

  canDeserialize(obj: any): boolean {
    return !!obj.hasOwnProperty('multi_match');
  }

  deserialize(obj: any): RangeMatch {
    this.field = obj.range.field;
    this.range = obj.range.range;
    return this;
  }

  buildQuery(): {} {
    let queryObj = { range: {} };

    queryObj.range[this.field] = {};

    for (let key in this.range) {
      queryObj.range[this.field][key] = this.range[key];
    }

    return queryObj;
  }
}

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

export class Field {
  static Channel = 'channel';
  static Topic = 'topic';
  static Title = 'title';
  static Timestamp = 'timestamp';
  static Duration = 'duration';
  static Size = 'size';
  static Description = 'description';
  static Website = 'website';
};
