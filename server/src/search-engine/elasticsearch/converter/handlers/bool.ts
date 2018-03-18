import { BoolQuery, QueryBody } from '../../../../common/search-engine';
import { ConvertHandler } from '../convert-handler';
import { Converter } from '../converter';

type ElasticsearchBooleanQuery = { bool: { must?: object, should?: object, must_not?: object, filter?: object } }

export class BoolQueryConvertHandler implements ConvertHandler {
  tryConvert(query: BoolQuery, index: string, type: string): object | null {
    const canHandle = ('bool' in query);

    if (!canHandle) {
      return null;
    }

    const queryObj: ElasticsearchBooleanQuery = {
      bool: {
        must: this.convertArray(query.bool.must, index, type),
        should: this.convertArray(query.bool.should, index, type),
        must_not: this.convertArray(query.bool.not, index, type),
        filter: this.convertArray(query.bool.filter, index, type)
      }
    };

    return queryObj;
  }

  private convertArray(queries: QueryBody[] | undefined, index: string, type: string): object[] | undefined {
    if (queries == undefined) {
      return undefined;
    }

    const converted = queries.map((query) => Converter.convertBody(query, index, type));
    return converted;
  }
}