import { IdsQuery } from '$shared/search-engine/query';
import { ConvertHandler, ConvertResult } from '../convert-handler';

type ElasticsearchIdsQuery = {
  ids: {
    type?: string | string[],
    values: string[]
  }
};

export class IdsQueryConvertHandler implements ConvertHandler {
  // eslint-disable-next-line class-methods-use-this
  tryConvert(query: IdsQuery, _index: string): ConvertResult {
    const canHandle = ('ids' in query);

    if (!canHandle) {
      return { success: false };
    }

    const queryObject: ElasticsearchIdsQuery = {
      ids: {
        values: query.ids
      }
    };

    return { success: true, result: queryObject };
  }
}
