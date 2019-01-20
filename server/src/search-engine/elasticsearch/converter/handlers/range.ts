import { RangeQuery } from '../../../../common/search-engine/query';
import { ConvertHandler, ConvertResult } from '../convert-handler';

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
  tryConvert(query: RangeQuery, _index: string, _type: string): ConvertResult {
    const canHandle = ('range' in query);

    if (!canHandle) {
      return { success: false };
    }

    const queryObject: ElasticsearchRangeQuery = {
      range: {
        [query.range.field]: {
          lt: this.convertValue(query.range.lt),
          gt: this.convertValue(query.range.gt),
          lte: this.convertValue(query.range.lte),
          gte: this.convertValue(query.range.gte)
        }
      }
    };

    return { success: true, result: queryObject };
  }

  private convertValue(value: string | number | Date | undefined): ElasticsearchRangeQueryValue | undefined {
    if (value instanceof Date) {
      const milliseconds = Math.floor(value.valueOf() / 1000);
      return milliseconds;
    }

    return value;
  }
}
