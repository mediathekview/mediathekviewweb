import { DateRounding, RangeQuery, RangeQueryValue } from '../../../../common/search-engine/query';
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

const DATE_ROUNDING_MAP = {
  [DateRounding.Seconds]: 's',
  [DateRounding.Minutes]: 'm',
  [DateRounding.Hours]: 'h',
  [DateRounding.Days]: 'd',
  [DateRounding.Weeks]: 'w',
  [DateRounding.Months]: 'M',
  [DateRounding.Years]: 'y'
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

  private convertValue(value: RangeQueryValue | undefined): ElasticsearchRangeQueryValue | undefined {
    if (value == undefined) {
      return undefined;
    }

    if (value.dateRounding != undefined) {
      const roundSymbol = DATE_ROUNDING_MAP[value.dateRounding];
      return `${value.value}/${roundSymbol}`;
    }

    return value.value;
  }
}
