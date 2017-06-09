import { ISearchEngine } from '../search-engine';
import { Query, QueryResponse, Entry } from '../../model';
import { IMapper } from './mapper';

type MappersType = { [key: string]: IMapper<any> };

export class RedisSearchEngine implements ISearchEngine {
  mappers: MappersType;
  constructor(mappers: MappersType = {}, autoMap: boolean = false) {

  }

  query(query: Query): Promise<QueryResponse> {
    return;
  }

  index(...entries: Entry[]): Promise<void> {
    return;
  }
}
