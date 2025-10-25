
import { TimeUnit } from '@valkey/valkey-glide';
import { getValkeyClient, ValkeyClient } from './ValKey';
import ogs from 'open-graph-scraper';

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
  cacheTTL: number
  baseCacheKey: string

  constructor(options: MetaDataLoaderOptions = {},baseCacheKey:string = 'metadata', cacheTTLInSeconds: number = 12 * 60 * 60) {
    this.options = {
      timeout: 4000,
      headers: {
        'accept-language': 'de'
      },
      ...options
    }

    this.baseCacheKey = baseCacheKey
    this.cacheTTL = cacheTTLInSeconds // defualt 12 hours

    this.valkey = getValkeyClient();
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

    const response = await ogs({
      url,
      ...this.options
    })
    
    await this.valkey.set(cacheKey, JSON.stringify(response), {
      expiry: {
        count: this.cacheTTL,
        type: TimeUnit.Seconds
      }
    })
    
    return response as object
  }
}