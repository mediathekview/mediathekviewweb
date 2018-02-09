import { MatchAllQuery } from '../../../../common/search-engine';
import { ConvertHandler } from '../convert-handler';

type ElasticsearchMatchAllQuery = { match_all: {} }

export class MatchAllQueryConvertHandler implements ConvertHandler {
  tryConvert(query: MatchAllQuery, index: string, type: string): object | null {
    const canHandle = ('matchAll' in query);

    if (!canHandle) {
      return null;
    }

    const queryObject: ElasticsearchMatchAllQuery = {
      match_all: {}
    };

    return queryObject;
  }
}