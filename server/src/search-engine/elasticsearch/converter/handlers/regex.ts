import { RegexQuery } from '../../../../common/search-engine/query';
import { ConvertHandler, ConvertResult } from '../convert-handler';

type ElasticsearchRegexQuery = { regexp: StringMap<string> };

export class RegexQueryConvertHandler implements ConvertHandler {
  tryConvert(query: RegexQuery, _index: string, _type: string): ConvertResult {
    const canHandle = ('regex' in query);

    if (!canHandle) {
      return false;
    }

    const queryObject: ElasticsearchRegexQuery = {
      regexp: {
        [query.regex.field]: query.regex.expression
      }
    };

    return queryObject;
  }
}
