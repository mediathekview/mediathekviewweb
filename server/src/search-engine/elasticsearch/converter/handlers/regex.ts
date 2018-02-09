import { IDsQuery, QueryBody, RegexQuery } from '../../../../common/search-engine';
import { ConvertHandler } from '../convert-handler';
import { Converter } from '../converter';

type ElasticsearchRegexQuery = { regexp: { [key: string]: string } }

export class RegexQueryConvertHandler implements ConvertHandler {
  tryConvert(query: RegexQuery, index: string, type: string): object | null {
    const canHandle = ('regex' in query);

    if (!canHandle) {
      return null;
    }

    const queryObject: ElasticsearchRegexQuery = {
      regexp: {}
    };

    queryObject.regexp[query.regex.field] = query.regex.expression;

    return queryObject;
  }
}