import { IDsQuery, QueryBody, RegexQuery } from '../../../../common/search-engine';
import { ConvertHandler } from '../convert-handler';
import { Converter } from '../converter';

type ElasticsearchRegexQuery = { regexp: ObjectMap<string> }

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