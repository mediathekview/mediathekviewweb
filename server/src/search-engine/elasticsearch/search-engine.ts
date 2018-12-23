import * as Elasticsearch from 'elasticsearch';
import { Logger } from '../../common/logger';
import { SearchEngine, SearchEngineItem, SearchResult } from '../../common/search-engine';
import { SearchQuery } from '../../common/search-engine/query';
import { timeout } from '../../common/utils';
import { Converter } from './converter';

type ElasticsearchBulkResponse = { took: number, errors: boolean, items: StringMap<ElasticsearchBulkResponseItem>[] };
type ElasticsearchBulkResponseItem = { [key: string]: any, status: number, error?: any };

export class ElasticsearchSearchEngine<T> implements SearchEngine<T> {
  private readonly client: Elasticsearch.Client;
  private readonly converter: Converter;
  private readonly indexName: string;
  private readonly typeName: string;
  private readonly logger: Logger;
  private readonly indexSettings: object | undefined;
  private readonly indexMapping: object | undefined;

  constructor(client: Elasticsearch.Client, converter: Converter, indexName: string, typeName: string, logger: Logger);
  constructor(client: Elasticsearch.Client, converter: Converter, indexName: string, typeName: string, logger: Logger, indexSettings: object);
  constructor(client: Elasticsearch.Client, converter: Converter, indexName: string, typeName: string, logger: Logger, indexSettings: object, indexMapping: object);
  constructor(client: Elasticsearch.Client, converter: Converter, indexName: string, typeName: string, logger: Logger, indexSettings?: object, indexMapping?: object) {
    this.client = client;
    this.converter = converter;
    this.indexName = indexName;
    this.typeName = typeName;
    this.logger = logger;
    this.indexSettings = indexSettings;
    this.indexMapping = indexMapping;
  }

  async initialize() {
    const created = await this.ensureIndex();

    if (created) {
      await this.putIndexOptions();
    }

    this.logger.info('initialized elasticsearch search-engine');
  }

  async index(items: SearchEngineItem<T>[]): Promise<void> {
    const bulkRequest: Elasticsearch.BulkIndexDocumentsParams = {
      index: this.indexName,
      type: this.typeName,
      refresh: false,
      body: [] as any[]
    };

    for (const item of items) {
      bulkRequest.body.push(
        { index: { _id: item.id } },
        item.document
      );
    }

    const response = await this.client.bulk(bulkRequest) as ElasticsearchBulkResponse;

    if (response.errors) {
      throw new Error(JSON.stringify(response, null, 2));
    }
  }

  async search(query: SearchQuery): Promise<SearchResult<T>> {
    const elasticsearchQuery = this.converter.convert(query, this.indexName, this.typeName);

    const result = await this.client.search<T>(elasticsearchQuery);
    const items = result.hits.hits.map((hit) => hit._source);

    const searchResult: SearchResult<T> = {
      total: result.hits.total,
      milliseconds: result.took,
      items: items
    };

    return searchResult;
  }

  async putIndexOptions(): Promise<void> {
    if (this.indexSettings != undefined || this.indexMapping != undefined) {
      await this.client.indices.close({ index: this.indexName });

      if (this.indexSettings != undefined) {
        await this.client.indices.putSettings({ index: this.indexName, body: this.indexSettings });
      }

      if (this.indexMapping != undefined) {
        const elasticsearchMappingObject = this.createElasticsearchMappingObject(this.indexMapping);
        await this.client.indices.putMapping({ index: this.indexName, type: this.typeName, body: elasticsearchMappingObject });
      }

      await this.client.indices.open({ index: this.indexName });
      await this.client.indices.refresh({ index: this.indexName });
    }
  }

  async drop(): Promise<void> {
    await this.client.indices.delete({ index: this.indexName });
    await this.initialize();
  }

  /**
   * @returns true if index was created, false if not.
   */
  private async ensureIndex(): Promise<boolean> {
    let created = false;

    const indexExists = await this.client.indices.exists({ index: this.indexName });

    if (!indexExists) {
      await this.client.indices.create({ index: this.indexName });
      created = true;
    }

    return created;
  }

  private createElasticsearchMappingObject(mapping: object): StringMap<object> {
    const actualMapping: StringMap<object> = {};
    actualMapping[this.typeName] = mapping;

    return actualMapping;
  }
}
