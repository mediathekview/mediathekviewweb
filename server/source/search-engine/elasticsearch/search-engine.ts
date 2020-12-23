import type { SearchEngine, SearchEngineItem, SearchResult } from '$shared/search-engine';
import type { SearchQuery } from '$shared/search-engine/query';
import type * as Elasticsearch from '@elastic/elasticsearch';
import { disposeAsync } from '@tstdl/base/disposable';
import type { LockProvider } from '@tstdl/base/lock';
import type { Logger } from '@tstdl/base/logger';
import type { Converter } from './converter';

export class ElasticsearchSearchEngine<T> implements SearchEngine<T> {
  private readonly client: Elasticsearch.Client;
  private readonly converter: Converter;
  private readonly indexName: string;
  private readonly lockProvider: LockProvider;
  private readonly logger: Logger;
  private readonly indexSettings: Elasticsearch.RequestParams.IndicesPutSettings | undefined;
  private readonly indexMapping: Elasticsearch.RequestParams.IndicesPutSettings | undefined;

  private disposing: boolean;

  constructor(client: Elasticsearch.Client, converter: Converter, indexName: string, lockProvider: LockProvider, logger: Logger, indexSettings?: Elasticsearch.RequestParams.IndicesPutSettings, indexMapping?: Elasticsearch.RequestParams.IndicesPutSettings) {
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
      await lock.using(1000, false, async () => {
        const created = await this.ensureIndex();

        if (created) {
          await this.putIndexOptions();
        }

        success = true;
        this.logger.verbose('initialized elasticsearch search-engine');
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async [disposeAsync](): Promise<void> {
    this.disposing = true;
  }

  async index(items: SearchEngineItem<T>[]): Promise<void> {
    const bulkRequest: Elasticsearch.RequestParams.Bulk<({ index: { _id: string } } | T)[]> = {
      index: this.indexName,
      refresh: false,
      body: []
    };

    for (const item of items) {
      bulkRequest.body.push(
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

    const _response = await this.client.search(elasticsearchQuery);
    throw new Error('check response');

    /*
     *  const { hits: { hits, total }, took: milliseconds } = response as any;
     *  const items = hits.map((hit) => hit._source);
     *
     *  const cursor = hits.length > 0 ? JSON.stringify(hits[hits.length - 1].sort) : undefined;
     *
     *  const searchResult: SearchResult<T> = {
     *    total,
     *    milliseconds,
     *    cursor,
     *    items
     *  };
     *
     *  return searchResult;
     */
  }

  async putIndexOptions(): Promise<void> {
    if (this.indexSettings != undefined || this.indexMapping != undefined) {
      await this.client.indices.close({ index: this.indexName });

      if (this.indexSettings != undefined) {
        await this.client.indices.putSettings({ index: this.indexName, body: this.indexSettings });
        this.logger.verbose(`applied elasticsearch index settings for ${this.indexName}`);
      }

      if (this.indexMapping != undefined) {
        const elasticsearchMappingObject = this.indexMapping;
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

    const { body: indexExists } = await this.client.indices.exists({ index: this.indexName }) as { body: boolean };

    if (!indexExists) {
      await this.client.indices.create({ index: this.indexName });
      await this.client.indices.open({ index: this.indexName });
      this.logger.verbose(`created elasticsearch index ${this.indexName}`);
      created = true;
    }

    return created;
  }
}
