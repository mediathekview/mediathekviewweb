import { MatchAllQuery, TermQuery } from '../../../../common/search-engine';
import { ConvertHandler } from '../convert-handler';

type ElasticsearchTermQuery = { term: StringMap<string | number | boolean | Date> }

export class TermQueryConvertHandler implements ConvertHandler {
  tryConvert(query: TermQuery, _index: string, _type: string): object | null {
    const canHandle = ('term' in query);

    if (!canHandle) {
      return null;
    }

    const queryObject: ElasticsearchTermQuery = {
      term: {
        [query.term.field]: query.term.value
      }
    };

    return queryObject;
  }
}