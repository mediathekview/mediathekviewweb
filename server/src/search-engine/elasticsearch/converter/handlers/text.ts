import { TextQuery } from '../../../../common/search-engine/query';
import { ConvertHandler } from '../convert-handler';

type ElasticsearchMatchOperator = 'and' | 'or';
type ElasticsearchMatchType = { query: string, operator: ElasticsearchMatchOperator };

type ElasticsearchMatchQuery = {
  match: StringMap<ElasticsearchMatchType>
};

type ElasticsearchMultiMatchType = 'best_fields' | 'most_fields' | 'cross_fields' | 'phrase' | 'phrase_prefix';

type ElasticsearchMultiMatchQuery = {
  multi_match: {
    type: ElasticsearchMultiMatchType,
    fields: string[],
    query: string,
    operator: ElasticsearchMatchOperator
  }
}

export class TextQueryConvertHandler implements ConvertHandler {
  tryConvert(query: TextQuery, _index: string, _type: string): object | null {
    const canHandle = ('text' in query);

    if (!canHandle) {
      return null;
    }

    let queryObject: object;

    if (query.text.fields.length == 1) {
      queryObject = this.convertToMatch(query.text.fields[0], query.text.text, query.text.operator);
    } else if (query.text.fields.length > 1) {
      queryObject = this.convertToMultiMatch(query);
    } else {
      throw new Error('no fields specified');
    }

    return queryObject;
  }

  convertToMatch(field: string, text: string, operator: ElasticsearchMatchOperator): ElasticsearchMatchQuery {
    const queryObj: ElasticsearchMatchQuery = {
      match: {
        [field]: {
          query: text,
          operator
        }
      }
    };

    return queryObj;
  }

  convertToMultiMatch(query: TextQuery): ElasticsearchMultiMatchQuery {
    const queryObj: ElasticsearchMultiMatchQuery = {
      multi_match: {
        type: 'cross_fields',
        fields: query.text.fields,
        query: query.text.text,
        operator: query.text.operator
      }
    };

    return queryObj;
  }
}
