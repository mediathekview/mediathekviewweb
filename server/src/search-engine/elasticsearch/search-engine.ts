import { LockProvider } from '@common-ts/base/lock';
import { Logger } from '@common-ts/base/logger';
import { Omit, StringMap } from '@common-ts/base/types';
import * as Elasticsearch from '@elastic/elasticsearch';
import { SearchEngine, SearchEngineItem, SearchResult } from '../../common/search-engine';
import { SearchQuery } from '../../common/search-engine/query';
import { Converter } from './converter';

export class ElasticsearchSearchEngine<T> implements SearchEngine<T> {
  private readonly client: Elasticsearch.Client;
  private readonly converter: Converter;
  private readonly indexName: string;
  private readonly lockProvider: LockProvider;
  private readonly logger: Logger;
  private readonly indexSettings: object | undefined;
  private readonly indexMapping: object | undefined;

  private disposing: boolean;

  constructor(client: Elasticsearch.Client, converter: Converter, indexName: string, lockProvider: LockProvider, logger: Logger, indexSettings?: object, indexMapping?: object) {
    this.client = client;
    this.converter = converter;
    this.indexName = indexName;
    this.lockProvider = lockProvider;
    this.logger = logger;
    this.indexSettings = indexSettings;
    this.indexMapping = indexMapping;

    this.disposing = false;
  }

  async initialize(): Promise<void> {
    const lock = this.lockProvider.get('ElasticsearchSearchEngine:initialize');

    let success = false;

    while (!success && !this.disposing) {
      await lock.acquire(1000, async () => {
        const created = await this.ensureIndex();

        if (created) {
          await this.putIndexOptions();
        }

        success = true;
        this.logger.verbose('initialized elasticsearch search-engine');
      });
    }
  }

  async dispose(): Promise<void> {
    this.disposing = true;
  }

  async index(items: SearchEngineItem<T>[]): Promise<void> {
    const bulkRequest: Elasticsearch.RequestParams.Bulk<({ index: object } | T)[]> = {
      index: this.indexName,
      refresh: 'false',
      body: [] // tslint:disable-line: no-any
    };

    for (const item of items) {
      bulkRequest.body.push( // tslint:disable-line: no-unsafe-any space-within-parens
        { index: { _id: item.id } },
        item.document
      );
    }

    const response = await this.client.bulk(bulkRequest) as Omit<Elasticsearch.ApiResponse, 'body'> & { body: { errors: boolean, took: number, items: object[] } };

    if (response.body.errors) {
      throw new Error(JSON.stringify(response.body.items, undefined, 2));
    }
  }

  async search(query: SearchQuery): Promise<SearchResult<T>> {
    const elasticsearchQuery = this.converter.convert(query, this.indexName);

    const response = await this.client.search(elasticsearchQuery) as Elasticsearch.ApiResponse;
    throw new Error('check response');

    /*    const { hits: { hits, total }, took: milliseconds } = response as any;
        const items = hits.map((hit) => hit._source);

        const cursor = hits.length > 0 ? JSON.stringify(hits[hits.length - 1].sort) : undefined;

        const searchResult: SearchResult<T> = {
          total,
          milliseconds,
          cursor,
          items
        };

        return searchResult; */
  }

  async putIndexOptions(): Promise<void> {
    if (this.indexSettings != undefined || this.indexMapping != undefined) {
      await this.client.indices.close({ index: this.indexName });

      if (this.indexSettings != undefined) {
        await this.client.indices.putSettings({ index: this.indexName, body: this.indexSettings });
        this.logger.verbose(`applied elasticsearch index settings for ${this.indexName}`);
      }

      if (this.indexMapping != undefined) {
        const elasticsearchMappingObject = this.indexMapping; // this.createElasticsearchMappingObject(this.indexMapping);
        await this.client.indices.putMapping({ index: this.indexName, type: undefined as any, body: elasticsearchMappingObject });
        this.logger.verbose(`applied elasticsearch index mapping for ${this.indexName}`);
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

    const { body: indexExists } = await this.client.indices.exists({ index: this.indexName }) as Elasticsearch.ApiResponse;

    if (!indexExists) {
      await this.client.indices.create({ index: this.indexName });
      await this.client.indices.open({ index: this.indexName });
      this.logger.verbose(`created elasticsearch index ${this.indexName}`);
      created = true;
    }

    return created;
  }

  private createElasticsearchMappingObject(mapping: object): StringMap<object> {
    const actualMapping: StringMap<object> = {};
    actualMapping['a'] = mapping;

    return actualMapping;
  }
}
