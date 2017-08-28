import { ISearchEngine, Query, SearchEngineSearchResult } from '../common/search-engine';
import { ElasticsearchSearchEngine } from '../search-engine/elasticsearch';
import * as Elasticsearch from 'elasticsearch';
import { Keys as ElasticsearchKeys } from '../elasticsearch-definitions';
import { IEntry } from '../common/model';
import config from '../config';
import { IMediathekViewWebAPI } from '../common/api';
import { Nullable } from '../common/utils';

export { IEntry, Query, SearchEngineSearchResult };

export class MediathekViewWebAPI implements IMediathekViewWebAPI {
  private searchEngine: ISearchEngine<IEntry>;

  constructor() {
    const elasticsearchClient = new Elasticsearch.Client({ host: `${config.elasticsearch.host}:${config.elasticsearch.port}` });
    this.searchEngine = new ElasticsearchSearchEngine<IEntry>(ElasticsearchKeys.IndexName, ElasticsearchKeys.TypeName, elasticsearchClient);
  }

  async search(query: Query): Promise<SearchEngineSearchResult<IEntry>> {
    const result = await this.searchEngine.search(query);

    return result;
  }
}
