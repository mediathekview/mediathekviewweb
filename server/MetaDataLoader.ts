
import { TimeUnit } from '@valkey/valkey-glide';
import { getValkeyClient, ValkeyClient } from './ValKey';
import { Client } from '@opensearch-project/opensearch';
import ogs from 'open-graph-scraper';
import { config } from './config';
import { OPENSEARCH_INDEX } from './keys';

// https://www.npmjs.com/package/open-graph-scraper/v/3.0.2?activeTab=readme
interface MetaDataLoaderOptions {
  timeout?: number;
  encoding?: string;
  headers?: object;
  blacklist?: string[];
  followAllRedirects?: boolean;
  maxRedirects?: number;
}

export class MetaDataLoader {
  valkey: ValkeyClient;
  options: MetaDataLoaderOptions
  searchClient: Client
  cacheTTL: number
  baseCacheKey: string

  constructor(options: MetaDataLoaderOptions = {}, baseCacheKey:string = 'metadata', cacheTTLInSeconds: number = 1 * 60 * 60) {
    this.options = {
      timeout: 4000,
      headers: {
        'accept-language': 'de'
      },
      ...options
    }

    this.baseCacheKey = baseCacheKey
    this.cacheTTL = cacheTTLInSeconds // defualt 1 hours

    this.valkey = getValkeyClient();

    this.searchClient = new Client(config.opensearch);
  }

  getCacheKey(url: string): string {
    return [this.baseCacheKey, url].join(":")
  }

  async getMetaData(url: string): Promise<object> {
    const cacheKey = this.getCacheKey(url)
    const cacheItem = await this.valkey.get(cacheKey)
    if(cacheItem){
      return JSON.parse(cacheItem as string) as object
    }

    let response = {data:{}}
    try {
      response = await ogs({
        url,
        ...this.options
      })
    } catch (error) {
      console.log("[META-DATA-LOADER]", url)
      response.data = {
        message: `Wasnt able to resolve meta data`
      }
    }
    
    await this.valkey.set(cacheKey, JSON.stringify(response), {
      expiry: {
        count: this.cacheTTL,
        type: TimeUnit.Seconds
      }
    })

    await this.updateDocumentInOpenSearch(url, response)
    
    return response as object
  }

  async updateDocumentInOpenSearch(url: string, metaDataResponse: any) {
    try {
      await this.searchClient.updateByQuery({
        index: OPENSEARCH_INDEX,
        body: {
          query: {
            term: {
              url_website: url
            }
          },
          script: {
            source: 'ctx._source.meta_data = params.meta_data',
            lang: 'painless',
            params: {
              meta_data: metaDataResponse.data
            }
          }
        }
      })
    } catch (error) {
      console.log("[META-DATA-LOADER-DB-SET]", error)
    }
  }
}