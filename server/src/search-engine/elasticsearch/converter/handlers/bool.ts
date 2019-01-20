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

  tryConvert(query: BoolQuery, index: string, type: string): ConvertResult {
    const canHandle = query.hasOwnProperty('bool');

    if (!canHandle) {
      return { success: false };
    }

    const queryObject: ElasticsearchBooleanQuery = {
      bool: {
        must: this.convertArray(query.bool.must, index, type),
        should: this.convertArray(query.bool.should, index, type),
        must_not: this.convertArray(query.bool.not, index, type),
        filter: this.convertArray(query.bool.filter, index, type)
      }
    };

    return { success: true, result: queryObject };
  }

  private convertArray(queries: QueryBody[] | undefined, index: string, type: string): object[] | undefined {
    if (queries == undefined) {
      return undefined;
    }

    const converted = queries.map((query) => this.converter.convertBody(query, index, type));
    return converted;
  }
}
