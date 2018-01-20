import { SearchEngine, SearchEngineItem, SearchQuery, SearchResult } from '../../common/search-engine';
import convertQuery from './query-converter';
import * as Elasticsearch from 'elasticsearch';

export class ElasticsearchSearchEngine<T> implements SearchEngine<T> {
  private readonly indexName: string;
  private readonly typeName: string;
  private readonly client: Elasticsearch.Client;
  private readonly indexSettings: { [key: string]: any } | undefined;
  private readonly mappings: { [key: string]: any } | undefined;

  constructor(indexName: string, typeName: string, client: Elasticsearch.Client, indexSettings?: {}, indexMappings?: {}) {
    this.indexName = indexName;
    this.typeName = typeName;
    this.client = client;
    this.indexSettings = indexSettings;

    if (indexMappings != undefined) {
      this.mappings = {};
      this.mappings[typeName] = indexMappings;
    }
  }

  async initialize() {
    await this.ensureIndex();

    if (this.indexSettings != undefined || this.mappings != undefined) {
      await this.client.indices.close({ index: this.indexName });

      if (this.indexSettings != undefined) {
        await this.client.indices.putSettings({ index: this.indexName, body: this.indexSettings });
      }

      if (this.mappings != undefined) {
        await this.client.indices.putMapping({ index: this.indexName, type: this.typeName, body: this.mappings });
      }

      await this.client.indices.open({ index: this.indexName });
    }
  }

  async index(entries: SearchEngineItem<T>[]): Promise<void> {
    const bulkRequest = {
      body: [] as any[],
      index: this.indexName,
      type: this.typeName
    };

    for (let entry of entries) {
      bulkRequest.body.push(
        { index: { _id: entry.id } },
        entry.document
      );
    }

    await this.client.bulk(bulkRequest);
  }

  async search(query: SearchQuery): Promise<SearchResult<T>> {
    const elasticsearchQuery = convertQuery(query, this.indexName, this.typeName);

    const result = await this.client.search<T>(elasticsearchQuery);

    const items = result.hits.hits.map((hit) => hit._source);

    const searchResult: SearchResult<T> = {
      total: result.hits.total,
      milliseconds: result.took,
      items: items
    };

    return searchResult;
  }

  private async ensureIndex() {
    const indexExists = await this.client.indices.exists({ index: this.indexName });

    if (!indexExists) {
      await this.client.indices.create({ index: this.indexName });
    }
  }
}
