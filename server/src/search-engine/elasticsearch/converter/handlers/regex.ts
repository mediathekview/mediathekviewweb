import { RegexQuery } from '../../../../common/search-engine/query';
import { ConvertHandler } from '../convert-handler';

type ElasticsearchRegexQuery = { regexp: StringMap<string> }

export class RegexQueryConvertHandler implements ConvertHandler {
  tryConvert(query: RegexQuery, _index: string, _type: string): object | null {
    const canHandle = ('regex' in query);

    if (!canHandle) {
      return null;
    }

    const queryObject: ElasticsearchRegexQuery = {
      regexp: {
        [query.regex.field]: query.regex.expression
      }
    };

    return queryObject;
  }
}
