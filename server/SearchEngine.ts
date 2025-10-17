import type { ClientOptions } from '@opensearch-project/opensearch';
import { Client } from '@opensearch-project/opensearch';
import type { TermsAggregation } from '@opensearch-project/opensearch/api/_types/_common.aggregations.js';
import type { Core_Get } from '@opensearch-project/opensearch/api/_types/index.js';

import { OPENSEARCH_INDEX } from './keys';
import { timeout } from './utils';

export class SearchEngine {
  client: Client;

  constructor(opensearchOptions: ClientOptions) {
    const configClone = structuredClone(opensearchOptions);
    this.client = new Client(configClone);
  }

  async waitForConnection(): Promise<void> {
    while (true) {
      try {
        await this.client.ping();
        console.info('Connected to OpenSearch');
        return;
      }
      catch (error) {
        console.warn(`Could not connect to OpenSearch (${(error as Error).message}), retrying in 2.5s...`);
        await timeout(2500);
      }
    }
  }

  async getChannels(): Promise<string[]> {
    const response = await this.client.search({
      index: OPENSEARCH_INDEX,
      size: 0,
      body: {
        aggs: {
          channels: {
            terms: {
              field: "channel.keyword",
              size: 100
            }
          }
        }
      }
    });

    return (response.body.aggregations.channels as TermsAggregation).buckets.map((bucket) => String(bucket.key));
  }

  async getDescription(id: string): Promise<string> {
    try {
      const response = await this.client.get({ index: OPENSEARCH_INDEX, id });
      return (response.body._source as any)?.description ?? '';
    }
    catch (error) {
      if (error.statusCode == 404) {
        throw new Error('Document not found');
      }

      throw error;
    }
  }

  async getEntries(ids: string[]): Promise<object[]> {
    const response = await this.client.mget({ index: OPENSEARCH_INDEX, body: { ids } });

    return response.body.docs
      .filter((doc) => 'found' in doc && doc.found)
      .map((doc) => (doc as Core_Get.GetResult)._source ?? {});
  }

  async search(query: any): Promise<{ result: any[], totalResults: number }> {
    const opensearchQuery = {
      index: OPENSEARCH_INDEX,
      from: query.offset || 0,
      size: query.size || 15,
      body: {
        query: {
          bool: {
            must: [],
            filter: [],
          }
        },
        sort: {}
      }
    };

    if (!query.queries || query.queries.length === 0) {
      opensearchQuery.body.query.bool.must.push({ match_all: {} });
    }
    else {
      const fieldsBasedQueries = new Map<string, any[]>();

      for (const q of query.queries) {
        const key = q.fields.slice().sort().join(',');

        if (!fieldsBasedQueries.has(key)) {
          fieldsBasedQueries.set(key, []);
        }

        fieldsBasedQueries.get(key)!.push(this.createMultiMatch(q.fields, q.query, 'and'));
      }

      for (const matches of fieldsBasedQueries.values()) {
        opensearchQuery.body.query.bool.must.push({
          bool: { should: matches }
        });
      }
    }

    if (query.duration_min != undefined || query.duration_max != undefined) {
      const durationFilter: { range: { duration: { gt?: number, lt?: number } } } = {
        range: { duration: {} }
      };

      if (query.duration_min != undefined) {
        durationFilter.range.duration.gt = query.duration_min;
      }

      if (query.duration_max != undefined) {
        durationFilter.range.duration.lt = query.duration_max;
      }
      opensearchQuery.body.query.bool.filter.push(durationFilter);
    }

    if (query.future === false) {
      opensearchQuery.body.query.bool.filter.push({
        range: {
          timestamp: { to: 'now+1h/h' }
        }
      });
    }

    if (typeof query.sortBy === 'string' && query.sortBy.length > 0) {
      opensearchQuery.body.sort = { [query.sortBy]: { order: query.sortOrder } };
    }

    try {
      const response = (await this.client.search(opensearchQuery)).body;

      const result = response.hits.hits.map((hit) => {
        const entry = hit._source as any;
        entry.id = hit._id;

        mapToMp4IfM3u8(entry);

        return entry;
      });

      const total = response.hits.total;
      const totalResults = (typeof total == 'number') ? total : (total?.value ?? 0);

      return { result, totalResults };
    }
    catch (error) {
      console.error("OpenSearch search error:", error);
      throw new Error('Search query failed', { cause: error });
    }
  }

  private createMultiMatch(fields: string[], query: string, operator: 'and' | 'or') {
    return {
      multi_match: {
        query: query,
        type: 'cross_fields',
        fields: fields,
        operator: operator
      }
    };
  }
}

function mapToMp4IfM3u8(entry: Record<string, any>): void {
  if (typeof entry.url_video !== 'string') {
    return;
  }

  if (isWdrM3u8(entry.url_video)) {
    const mp4s = wdrM3u8ToMp4(entry.url_video);

    if (mp4s) {
      entry.url_video_low = mp4s[0];
      entry.url_video = mp4s[2];
      entry.url_video_hd = mp4s[4];
    }
  }
  else if (isBrM3u8(entry.url_video)) {
    const mp4s = brM3u8ToMp4(entry.url_video);

    if (mp4s) {
      entry.url_video_low = mp4s[2];
      entry.url_video = mp4s[3];
      entry.url_video_hd = mp4s[4];
    }
  }
}

const wdrRegex = /https?:\/\/wdradaptiv-vh.akamaihd.net\/i\/medp\/ondemand\/(?<region>\S+?)\/(?<fsk>\S+?)\/(?<unknownNumber>\d+?)\/(?<id>\d+?)\/(?:AKA_INT_GOORIGIN\/)?,?(?<qualitiesString>[,\d_]+?),?\.mp4.*m3u8/;
const brRegex = /https?:\/\/cdn-vod-ios.br.de\/i\/(.*?),([a-zA-Z0-9,]+),\.mp4\.csmil/;

function isWdrM3u8(url: string): boolean {
  return wdrRegex.test(url);
}

function wdrM3u8ToMp4(url: string): string[] | null {
  const match = wdrRegex.exec(url);

  if (!match?.groups) {
    return null;
  }

  const { region, fsk, unknownNumber, id, qualitiesString } = match.groups;
  const qualities = qualitiesString
    .split(',')
    .map((quality) => `http://wdrmedien-a.akamaihd.net/medp/ondemand/${region}/${fsk}/${unknownNumber}/${id}/${quality}.mp4`);

  return qualities;
}

function isBrM3u8(url: string): boolean {
  return brRegex.test(url);
}

function brM3u8ToMp4(url: string): string[] | null {
  const match = brRegex.exec(url);

  if (match === null) {
    return null;
  }

  const [, path, qualitiesString] = match;
  const qualities = qualitiesString
    .split(',')
    .map((quality) => `http://cdn-storage.br.de/${path}${quality}.mp4`);

  return qualities;
}
