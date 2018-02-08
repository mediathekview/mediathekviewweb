import { RangeQuery } from '../../../../common/search-engine';
import { Converter } from '../converter';

type ElasticSearchRangeQueryValue = number | string;
type ElasticSearchRangeQuery = {
  [key: string]: {
    lt?: ElasticSearchRangeQueryValue,
    gt?: ElasticSearchRangeQueryValue,
    lte?: ElasticSearchRangeQueryValue,
    gte?: ElasticSearchRangeQueryValue,
    format?: string
  }
};

const MILLISECONDS_TYPE = 'epoch_millis';

export class RangeQueryConverter implements Converter {
  private readonly converter: Converter;

  constructor(converter: Converter) {
    this.converter = converter;
  }

  tryConvert(query: RangeQuery, index: string, type: string): object {
    const canHandle = ('range' in query);

    if (!canHandle) {
      return null;
    }
   
    const queryObj = {
      range: {} as ElasticSearchRangeQuery
    };

    queryObj.range[query.range.field].lt = this.convertValue(query.range.lt);
    queryObj.range[query.range.field].gt = this.convertValue(query.range.gt);
    queryObj.range[query.range.field].lte = this.convertValue(query.range.lte);
    queryObj.range[query.range.field].gte = this.convertValue(query.range.gte);

    const anyIsDate = this.anyIsDate(query);

    if (anyIsDate) {
      queryObj.range[query.range.field].format = MILLISECONDS_TYPE;
    }

    return queryObj;
  }

  private anyIsDate(query: RangeQuery): boolean {
    if (
      query.range.lt instanceof Date ||
      query.range.gt instanceof Date ||
      query.range.lte instanceof Date ||
      query.range.gte instanceof Date
    ) {
      return true;
    }

    return false;
  }

  private convertValue(value: string | number | Date | undefined): ElasticSearchRangeQueryValue | undefined {
    if (value == undefined) {
      return undefined;
    }

    const type = typeof value;

    if (type == 'number' || type == 'string') {
      return value as number | string;
    }

    if (value instanceof Date) {
      const milliseconds = Math.floor(value.valueOf() / 1000);
      return milliseconds;
    }
  }
}