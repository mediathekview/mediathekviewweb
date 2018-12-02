import { SearchParams } from 'elasticsearch';

import { QueryBody, SearchQuery } from '../../../common/search-engine';
import { ConvertHandler } from './convert-handler';
import {
  BoolQueryConvertHandler,
  IDsQueryConvertHandler,
  MatchAllQueryConvertHandler,
  RangeQueryConvertHandler,
  RegexQueryConvertHandler,
  SortConverter,
  TermQueryConvertHandler,
  TextQueryConvertHandler,
} from './handlers';

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 250;

export class Converter {
  private readonly handlers: ConvertHandler[];
  private readonly sortConverter: SortConverter;

  constructor(sortConverter: SortConverter) {
    this.handlers = [];
    this.sortConverter = sortConverter;
  }

  registerHandler(...handlers: ConvertHandler[]) {
    this.handlers.push(...handlers);
  }

  convert(query: SearchQuery, index: string, type: string): SearchParams {
    if (query.skip == undefined) {
      query.skip = 0;
    }

    if (query.limit == undefined) {
      query.limit = DEFAULT_LIMIT;
    } else if (query.limit > MAX_LIMIT) {
      throw new Error(`Limit of ${query.limit} is above maximum (${MAX_LIMIT})`);
    }

    const queryBody = this.convertBody(query.body, index, type);

    const elasticQuery: SearchParams = {
      index,
      type,
      from: query.skip,
      size: query.limit,
      body: {
        query: queryBody
      }
    };

    this.setSort(query, elasticQuery);

    return elasticQuery;
  }

  private setSort(query: SearchQuery, elasticQuery: SearchParams) {
    if (query.sort != undefined && query.sort.length > 0) {
      const sort = query.sort.map((sort) => this.sortConverter.convert(sort));
      elasticQuery.body['sort'] = sort;
    }
  }

  convertBody(queryBody: QueryBody, index: string, type: string): object {
    for (const handler of this.handlers) {
      const converted = handler.tryConvert(queryBody, index, type);

      if (converted != null) {
        return converted;
      }
    }

    throw new Error('not suitable handler for query available');
  }
}
