import { IDsQuery, QueryBody } from '../../../../common/search-engine';
import { ConvertHandler } from '../convert-handler';
import { Converter } from '../converter';

type ElasticsearchIDsQuery = {
  ids: {
    type?: string | string[],
    values: string[]
  }
}

export class IDsQueryConvertHandler implements ConvertHandler {
  tryConvert(query: IDsQuery, index: string, type: string): object | null {
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