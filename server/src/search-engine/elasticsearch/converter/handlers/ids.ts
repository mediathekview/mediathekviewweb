import { IdsQuery } from '../../../../common/search-engine/query';
import { ConvertHandler, ConvertResult } from '../convert-handler';

type ElasticsearchIdsQuery = {
  ids: {
    type?: string | string[],
    values: string[]
  }
};

export class IdsQueryConvertHandler implements ConvertHandler {
  tryConvert(query: IdsQuery, _index: string, type: string): ConvertResult {
    const canHandle = ('ids' in query);

    if (!canHandle) {
      return { success: false };
    }

    const queryObject: ElasticsearchIdsQuery = {
      ids: {
        type,
        values: query.ids
      }
    };

    return { success: true, result: queryObject };
  }
}
