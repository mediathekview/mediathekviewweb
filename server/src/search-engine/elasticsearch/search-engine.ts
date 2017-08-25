import { ISearchEngine, SearchEngineEntry, Query, SearchEngineSearchResult } from '../';
import convertQuery from './query-converter';
import * as Elasticsearch from 'elasticsearch';

export class ElasticsearchSearchEngine<T> implements ISearchEngine<T> {
  private initialized: boolean = false;
  private initializationPromise: Promise<any>;

  constructor(private indexName: string, private typeName: string, private elasticsearchClient: Elasticsearch.Client, private indexSettings?: {}, private indexMappings?: {}) {
    this.initializationPromise = this.initialize();
  }

  private async initialize() {
    const indexExists = await this.elasticsearchClient.indices.exists({ index: this.indexName });

    const mappings = {};
    mappings[this.typeName] = this.indexMappings;

    if (!indexExists) {
      await this.elasticsearchClient.indices.create({ index: this.indexName });
    }

    if (this.indexSettings || this.indexMappings) {
      await this.elasticsearchClient.indices.close({ index: this.indexName });

      if (this.indexSettings) {
        await this.elasticsearchClient.indices.putSettings({ index: this.indexName, body: this.indexSettings });
      }

      if (this.indexMappings) {
        await this.elasticsearchClient.indices.putMapping({ index: this.indexName, type: this.typeName, body: this.indexMappings });
      }

      await this.elasticsearchClient.indices.open({ index: this.indexName });
    }

    this.initialized = true;
  }

  async index(...entries: SearchEngineEntry<T>[]): Promise<void> {
    if (entries.length == 0) {
      return;
    }

    if (!this.initialized) {
      await this.initializationPromise;
    }

    const params: {}[] = [];

    for (let entry of entries) {
      params.push(
        { index: { _id: entry.id } },
        entry.document
      );
    }

    await this.elasticsearchClient.bulk({ body: params, index: this.indexName, type: this.typeName });
  }

  async search(query: Query): Promise<SearchEngineSearchResult<T>> {
    const elasticsearchQuery = convertQuery(query, this.indexName, this.typeName);

    console.log(elasticsearchQuery)

    const result = await this.elasticsearchClient.search<T>(elasticsearchQuery);

    const items: T[] = result.hits.hits.map((hit) => hit._source);

    const searchResult: SearchEngineSearchResult<T> = {
      items: items,
      total: result.hits.total,
      milliseconds: result.took
    };

    return searchResult;
  }
}
