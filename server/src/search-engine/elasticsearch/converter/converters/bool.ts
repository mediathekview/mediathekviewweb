import { Converter } from '../converter';
import { QueryBody, BoolQuery } from '../../../../common/search-engine';

type ElasticSearchBooleanQuery = { must?: object, should?: object, must_not?: object, filter?: object };

export class BoolQueryConverter implements Converter {

  constructor() {
  }

  tryConvert(query: BoolQuery, index: string, type: string): object | null {
    const canHandle = ('bool' in query);

    if (!canHandle) {
      return null;
    }

    const queryObj = {
      bool: {} as ElasticSearchBooleanQuery
    };

    queryObj.bool.must = this.convertArray(query.bool.must, index, type);
    queryObj.bool.should = this.convertArray(query.bool.should, index, type);
    queryObj.bool.must_not = this.convertArray(query.bool.not, index, type);
    queryObj.bool.filter = this.convertArray(query.bool.filter, index, type);

    return queryObj;
  }

  private convertArray(queries: QueryBody[] | undefined, index: string, type: string): object[] | undefined {
    throw new Error('not implemented');

    if (queries == undefined) {
      return undefined;
    }

    // const converted = queries.map((query) => this.mainConverter.convert(query, index, type));
    // return converted;
  }
}