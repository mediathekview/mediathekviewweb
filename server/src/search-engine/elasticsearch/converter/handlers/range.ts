import { RangeQuery } from '../../../../common/search-engine';
import { ConvertHandler } from '../convert-handler';

type ElasticsearchRangeQueryValue = number | string
type ElasticsearchRangeQuery = {
  range: {
    [key: string]: {
      lt?: ElasticsearchRangeQueryValue,
      gt?: ElasticsearchRangeQueryValue,
      lte?: ElasticsearchRangeQueryValue,
      gte?: ElasticsearchRangeQueryValue,
      format?: string
    }
  }
}

const MILLISECONDS_TYPE = 'epoch_millis';

export class RangeQueryConvertHandler implements ConvertHandler {
  tryConvert(query: RangeQuery, _index: string, _type: string): object | null {
    const canHandle = ('range' in query);

    if (!canHandle) {
      return null;
    }

    const queryObj: ElasticsearchRangeQuery = {
      range: {}
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

  private convertValue(value: string | number | Date | undefined): ElasticsearchRangeQueryValue | undefined {
    if (value instanceof Date) {
      const milliseconds = Math.floor(value.valueOf() / 1000);
      return milliseconds;
    }

    return value;
  }
}