import * as Elasticsearch from 'elasticsearch';
import { Entry } from './model';

const INDEX = 'filmliste';
const TYPE = 'entries';

export class ElasticsearchService {
  private static _instance: ElasticsearchService;

  private client: Elasticsearch.Client;

  private constructor() {
    this.client = new Elasticsearch.Client({ host: `localhost:9200` });
  }

  static getInstance(): ElasticsearchService {
    if (this._instance == undefined) {
      this._instance = new ElasticsearchService();
    }

    return this._instance;
  }

  search(params: Elasticsearch.SearchParams): Promise<Elasticsearch.SearchResponse<Entry>> {
    return new Promise<Elasticsearch.SearchResponse<Entry>>((resolve, reject) => {
      this.client.search<Entry>(params, (error, response: Elasticsearch.SearchResponse<Entry>) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  bulk(params: Elasticsearch.BulkIndexDocumentsParams): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.client.bulk(params, (error, response) => {
          if (error) {
              reject(error);
          } else {
            resolve(response);
          }
      });
    });
  }
}
