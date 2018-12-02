import { IDsQuery } from '../../../../common/search-engine/query';
import { ConvertHandler } from '../convert-handler';

type ElasticsearchIDsQuery = {
  ids: {
    type?: string | string[],
    values: string[]
  }
}

export class IDsQueryConvertHandler implements ConvertHandler {
  tryConvert(query: IDsQuery, _index: string, type: string): object | null {
    const canHandle = ('ids' in query);

    if (!canHandle) {
      return null;
    }

    const queryObj: ElasticsearchIDsQuery = {
      ids: {
        type: type,
        values: query.ids
      }
    };

    return queryObj;
  }
}
