import { ISearchEngine, SearchEngineEntry } from '../';
import * as Elasticsearch from 'elasticsearch';

export class ElasticsearchSearchEngine<T> implements ISearchEngine<T> {
  private initialized: boolean = false;
  private initializationPromise: Promise<any>;

  constructor(private indexName: string, private typeName: string, private elasticsearchClient: Elasticsearch.Client, private indexSettings: {}, private indexMapping: {}) {
    this.initializationPromise = this.initialize();
  }

  private async initialize() {
    const indexExists = await this.elasticsearchClient.indices.exists({ index: this.indexName });

    const mappings = {};
    mappings[this.typeName] = this.indexMapping;

    if (!indexExists) {
      await this.elasticsearchClient.indices.create({ index: this.indexName, settings: this.indexSettings, mappings: mappings } as Elasticsearch.IndicesCreateParams);
    }

    //await this.elasticsearchClient.indices.putSettings({ index: this.indexName, body: this.indexSettings });
    //await this.elasticsearchClient.indices.putMapping({ index: this.indexName, type: this.typeName, body: this.indexMapping });

    this.initialized = true;
  }

  async index(...entries: SearchEngineEntry<T>[]): Promise<void> {
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
}
