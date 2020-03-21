import { StringMap } from '@tstdl/base/types';
import { TermQuery } from '../../../../common/search-engine/query';
import { ConvertHandler, ConvertResult } from '../convert-handler';

type ElasticsearchTermQuery = { term: StringMap<string | number | boolean | Date> };

export class TermQueryConvertHandler implements ConvertHandler {
  // eslint-disable-next-line class-methods-use-this
  tryConvert(query: TermQuery, _index: string): ConvertResult {
    const canHandle = ('term' in query);

    if (!canHandle) {
      return { success: false };
    }

    const queryObject: ElasticsearchTermQuery = {
      term: {
        [query.term.field]: query.term.value
      }
    };

    return { success: true, result: queryObject };
  }
}
