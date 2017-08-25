import { Query, SearchEngineSearchResult } from '../search-engine';
import { ElasticsearchSearchEngine } from '../search-engine/elasticsearch';
import * as Elasticsearch from 'elasticsearch';
import { Keys as ElasticsearchKeys } from '../elasticsearch-definitions';
import { IEntry } from '../common';
import config from '../config';
import { Nullable } from '../utils';

export class MediathekViewWebAPI {
  private searchEngine: ElasticsearchSearchEngine<IEntry>;

  constructor() {
    const elasticsearchClient = new Elasticsearch.Client({ host: `${config.elasticsearch.host}:${config.elasticsearch.port}` });

    this.searchEngine = new ElasticsearchSearchEngine<IEntry>(ElasticsearchKeys.IndexName, ElasticsearchKeys.TypeName, elasticsearchClient);
  }

  async search(query: Query): Promise<SearchEngineSearchResult<IEntry>> {
    const result = await this.searchEngine.search(query);

    return result;
  }
}




export { Query, SearchEngineSearchResult } from '../search-engine';
export { IEntry } from '../common';
