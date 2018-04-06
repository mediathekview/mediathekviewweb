import { RangeQuery } from '../../../../common/search-engine';
import { ConvertHandler } from '../convert-handler';

type ElasticsearchRangeQueryValue = number | string;

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
};

export class RangeQueryConvertHandler implements ConvertHandler {
  tryConvert(query: RangeQuery, _index: string, _type: string): object | null {
    const canHandle = ('range' in query);

    if (!canHandle) {
      return null;
    }

    const queryObj: ElasticsearchRangeQuery = {
      range: {
        [query.range.field]: {
          lt: this.convertValue(query.range.lt),
          gt: this.convertValue(query.range.gt),
          lte: this.convertValue(query.range.lte),
          gte: this.convertValue(query.range.gte)
        }
      }
    };

    return queryObj;
  }

  private convertValue(value: string | number | Date | undefined): ElasticsearchRangeQueryValue | undefined {
    if (value instanceof Date) {
      const milliseconds = Math.floor(value.valueOf() / 1000);
      return milliseconds;
    }

    return value;
  }
}