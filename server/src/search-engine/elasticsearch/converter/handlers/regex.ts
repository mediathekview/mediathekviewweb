import { StringMap } from '@tstdl/base/types';
import { RegexQuery } from '../../../../common/search-engine/query';
import { ConvertHandler, ConvertResult } from '../convert-handler';

type ElasticsearchRegexQuery = { regexp: StringMap<string> };

export class RegexQueryConvertHandler implements ConvertHandler {
  tryConvert(query: RegexQuery, _index: string): ConvertResult {
    const canHandle = ('regex' in query);

    if (!canHandle) {
      return { success: false };
    }

    const queryObject: ElasticsearchRegexQuery = {
      regexp: {
        [query.regex.field]: query.regex.expression
      }
    };

    return { success: true, result: queryObject };
  }
}
