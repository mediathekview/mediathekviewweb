import { MatchAllQuery } from '../../../../common/search-engine/query';
import { ConvertHandler, ConvertResult } from '../convert-handler';

type ElasticsearchMatchAllQuery = { match_all: {} };

export class MatchAllQueryConvertHandler implements ConvertHandler {
  tryConvert(query: MatchAllQuery, _index: string): ConvertResult {
    const canHandle = ('matchAll' in query);

    if (!canHandle) {
      return { success: false };
    }

    const queryObject: ElasticsearchMatchAllQuery = {
      match_all: {}
    };

    return { success: true, result: queryObject };
  }
}
