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
const MAX_LIMIT = 100;

export class Converter {
  private static readonly handlers: ConvertHandler[] = [];
  private static readonly sortConverter = new SortConverter();

  static convert(query: SearchQuery, index: string, type: string): object {
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
      index: index,
      type: type,
      from: query.skip,
      size: query.limit,
      body: {
        query: queryBody
      }
    } as any;

    if (query.sort != undefined && query.sort.length > 0) {
      const sort = query.sort.map((sort) => this.sortConverter.convert(sort));

      elasticQuery.body['sort'] = sort;
    }

    return elasticQuery;
  }

  static registerHandler(...handlers: ConvertHandler[]) {
    this.handlers.push(...handlers);
  }

  static convertBody(queryBody: QueryBody, index: string, type: string): object {
    for (const handler of this.handlers) {
      const converted = handler.tryConvert(queryBody, index, type);

      if (converted != null) {
        return converted;
      }
    }

    throw new Error('not suitable handler for query available');
  }
}

Converter.registerHandler(
  new TextQueryConvertHandler(),
  new IDsQueryConvertHandler(),
  new MatchAllQueryConvertHandler(),
  new RegexQueryConvertHandler(),
  new TermQueryConvertHandler(),
  new BoolQueryConvertHandler(),
  new RangeQueryConvertHandler()
);