import { MatchAllQuery } from '../../../../common/search-engine/query';
import { ConvertHandler, ConvertResult } from '../convert-handler';

type ElasticsearchMatchAllQuery = { match_all: {} }; // eslint-disable-line camelcase

export class MatchAllQueryConvertHandler implements ConvertHandler {
  // eslint-disable-next-line class-methods-use-this
  tryConvert(query: MatchAllQuery, _index: string): ConvertResult {
    const canHandle = ('matchAll' in query);

    if (!canHandle) {
      return { success: false };
    }

    const queryObject: ElasticsearchMatchAllQuery = {
      match_all: {} // eslint-disable-line camelcase
    };

    return { success: true, result: queryObject };
  }
}
