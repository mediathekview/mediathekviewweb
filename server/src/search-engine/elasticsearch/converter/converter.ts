import { SearchParams } from 'elasticsearch';
import { QueryBody, SearchQuery } from '../../../common/search-engine/query';
import { ConvertHandler } from './convert-handler';
import { SortConverter } from './handlers';

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 250;

type Cursor = {
  mode: 'skip';
  value: number;
} | {
  mode: 'sort';
  value: any[];
};

export class Converter {
  private readonly handlers: ConvertHandler[];
  private readonly sortConverter: SortConverter;

  constructor(sortConverter: SortConverter) {
    this.handlers = [];
    this.sortConverter = sortConverter;
  }

  registerHandler(...handlers: ConvertHandler[]): void {
    this.handlers.push(...handlers);
  }

  convert(query: SearchQuery, index: string, type: string): SearchParams {
    if ((query.skip != undefined) && (query.cursor != undefined)) {
      throw new Error('cursor cannot be used with skip in combination');
    }

    const cursor = (query.cursor != undefined) ? this.decodeCursor(query.cursor) : undefined;
    const from = (cursor != undefined) ? cursor.skip : query.skip;
    const searchAfter = (cursor != undefined) ? cursor.searchAfter : undefined;
    const size = (query.limit != undefined) ? query.limit : DEFAULT_LIMIT;

    if (size > MAX_LIMIT) {
      throw new Error(`Limit of ${query.limit} is above maximum allowed (${MAX_LIMIT})`);
    }

    const queryBody = this.convertBody(query.body, index, type);

    const elasticQuery: SearchParams = {
      index,
      type,
      from,
      size,
      body: {
        query: queryBody,
        sort: this.getSort(query),
        searchAfter
      }
    };

    return elasticQuery;
  }

  convertBody(queryBody: QueryBody, index: string, type: string): object {
    for (const handler of this.handlers) {
      const converted = handler.tryConvert(queryBody, index, type);

      if (converted.success) {
        return converted.result;
      }
    }

    throw new Error('not suitable handler for query available');
  }

  private getSort(query: SearchQuery): object {
    const querySort = (query.sort == undefined) ? [] : query.sort;
    return querySort.map((sort) => this.sortConverter.convert(sort));
  }

  private decodeCursor(encodedCursor: string): { skip: number | undefined, searchAfter: any[] | undefined } {
    try {
      const cursor = JSON.parse(encodedCursor) as Cursor;

      switch (cursor.mode) {
        case 'skip':
          if (typeof cursor.value != 'number') {
            throw 5;
          }

          return { skip: cursor.value, searchAfter: undefined };

        case 'sort':
          if (!Array.isArray(cursor.value)) {
            throw 5;
          }

          return { skip: undefined, searchAfter: cursor.value };

        default:
          throw 5;
      }
    }
    catch {
      throw new Error('invalid cursor');
    }
  }
}
