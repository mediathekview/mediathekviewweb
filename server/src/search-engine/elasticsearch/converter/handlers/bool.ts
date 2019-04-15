import { BoolQuery, QueryBody } from '../../../../common/search-engine/query';
import { ConvertHandler, ConvertResult } from '../convert-handler';
import { Converter } from '../converter';

type ElasticsearchBooleanQuery = {
  bool: {
    must?: object,
    should?: object,
    must_not?: object,
    filter?: object
  }
};

export class BoolQueryConvertHandler implements ConvertHandler {
  private readonly converter: Converter;

  constructor(converter: Converter) {
    this.converter = converter;
  }

  tryConvert(query: BoolQuery, index: string): ConvertResult {
    const canHandle = query.hasOwnProperty('bool');

    if (!canHandle) {
      return { success: false };
    }

    const queryObject: ElasticsearchBooleanQuery = {
      bool: {
        must: this.convertArray(query.bool.must, index),
        should: this.convertArray(query.bool.should, index),
        must_not: this.convertArray(query.bool.not, index),
        filter: this.convertArray(query.bool.filter, index)
      }
    };

    return { success: true, result: queryObject };
  }

  private convertArray(queries: QueryBody[] | undefined, index: string): object[] | undefined {
    if (queries == undefined) {
      return undefined;
    }

    const converted = queries.map((query) => this.converter.convertBody(query, index));
    return converted;
  }
}
