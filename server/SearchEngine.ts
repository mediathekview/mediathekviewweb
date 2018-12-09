
import Elasticsearch from 'elasticsearch';
import { arraysHasSameElements, timeout } from './utils';

export default class SearchEngine {
  client: Elasticsearch.Client;

  constructor(elasticsearchOptions: Elasticsearch.ConfigOptions) {
    const configClone = JSON.parse(JSON.stringify(elasticsearchOptions));
    this.client = new Elasticsearch.Client(configClone);
  }

  async waitForConnection(): Promise<void> {
    let success = false;

    do {
      try {
        await this.client.ping({ requestTimeout: 250 });
        success = true;
        console.info('connected to elasticsearch');
      } catch (error) {
        console.warn(`couldn't connect to elasticsearch (${error.message}), trying again...`)
        await timeout(2500);
      }
    } while (!success);
  }

  isBooleanString(str) {
    if (typeof str != 'string')
      return false;

    return /^(false|true)$/.test(str);
  }

  isIntegerString(str) {
    if (typeof str != 'string')
      return false;

    return /^\d+$/.test(str);
  }

  getChannels(callback) {
    this.client.search({
      index: 'filmliste',
      type: 'entries',
      size: 100,
      body: {
        aggs: {
          filmliste: {
            terms: {
              field: "channel.keyword",
              size: 100
            }
          }
        }
      }
    }, (err, response) => {
      if (err) {
        callback(err);
        console.error(response);
      } else {
        callback(err, response.aggregations.filmliste.buckets.map((bucket) => bucket.key));
      }
    });
  }

  getDescription(id, callback) {
    this.client.get({
      index: 'filmliste',
      type: 'entries',
      id: id
    }, (err, response) => {
      if (err) {
        callback('error: ' + response);
        console.error(response);
      } else if (!response.found) {
        callback('document not found');
      } else {
        callback((response._source as any).description);
      }
    });
  }

  search(query, callback) {
    let elasticQuery = {
      index: 'filmliste',
      type: 'entries',
      from: query.offset || 0,
      size: query.size || 15,
      body: {
        query: {
          bool: {
            must: [],
            filter: []
          }
        },
        sort: {}
      }
    };

    let queries = query.queries;

    if (queries == undefined) {
      elasticQuery.body.query.bool.must.push({
        match_all: {}
      });
    } else {
      let fieldsBasedQueries = [];

      for (let i = 0; i < queries.length; i++) {
        let match = this.createMultiMatch(queries[i].fields, queries[i].query, 'and');

        let found = false;
        for (let j = 0; j < fieldsBasedQueries.length; j++) {
          if (arraysHasSameElements(queries[i].fields, fieldsBasedQueries[j].fields)) {
            fieldsBasedQueries[j].matches.push(match);
            found = true;
            break;
          }
        }

        if (!found) {
          fieldsBasedQueries.push({
            fields: queries[i].fields,
            matches: [match]
          });
        }
      }

      for (let i = 0; i < fieldsBasedQueries.length; i++) {
        let boolQuery = {
          bool: {
            should: []
          }
        };

        for (let j = 0; j < fieldsBasedQueries[i].matches.length; j++) {
          boolQuery.bool.should.push(fieldsBasedQueries[i].matches[j]);
        }

        elasticQuery.body.query.bool.must.push(boolQuery);
      }
    }

    if (query.future === false) {
      let rangeFilter = {
        range: {
          timestamp: {
            to: 'now+1h/h'
          }
        }
      };

      elasticQuery.body.query.bool.filter.push(rangeFilter);
    }

    if (typeof query.sortBy == 'string' && query.sortBy.length > 0) {
      let sort = {};
      sort[query.sortBy] = {
        order: query.sortOrder
      };

      elasticQuery.body.sort = sort;
    }

    this.client.search(elasticQuery, (error, response) => {
      if (error) {
        callback(null, ['Elasticsearch: ' + error.message]);
      } else {
        const result = [];

        for (let i = 0; i < response.hits.hits.length; i++) {
          const entry = response.hits.hits[i]._source as any;
          entry.id = response.hits.hits[i]._id;

          mapToMp4IfM3u8(entry);

          result.push(entry);
        }

        callback({
          result: result,
          totalResults: response.hits.total
        }, null);
      }
    });
  }

  createMultiMatch(fields, query, operator) {
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

function mapToMp4IfM3u8(entry) {
  if (isWdrM3u8(entry.url_video)) {
    const mp4s = WdrM3u8ToMp4(entry.url_video);

    entry.url_video_low = mp4s[0];
    entry.url_video = mp4s[2];
    entry.url_video_hd = mp4s[4];
  }
  else if (isBrM3u8(entry.url_video)) {
    const mp4s = BrM3u8ToMp4(entry.url_video);

    entry.url_video_low = mp4s[2];
    entry.url_video = mp4s[3];
    entry.url_video_hd = mp4s[4];
  }
}

const wdrRegex = /https?:\/\/wdradaptiv-vh.akamaihd.net\/i\/medp\/ondemand\/(\S+?)\/(\S+?)\/(\d+?)\/(\d+?)\/,?([,\d_]+?),?\.mp4.*m3u8/;
const brRegex = /https?:\/\/cdn-vod-ios.br.de\/i\/(.*?),([a-zA-Z0-9,]+),\.mp4\.csmil/;

function isWdrM3u8(url: string): boolean {
  return wdrRegex.test(url);
}

function WdrM3u8ToMp4(url: string): string[] {
  const match = wdrRegex.exec(url);

  if (match == null) {
    throw new Error('invalid url');
  }

  const [, region, fsk, unknownNumber, id, qualitiesString] = match;
  const qualities = qualitiesString.split(',');
  const mp4s = qualities.map((quality) => `http://wdrmedien-a.akamaihd.net/medp/ondemand/${region}/${fsk}/${unknownNumber}/${id}/${quality}.mp4`);

  return mp4s;
}

function isBrM3u8(url: string): boolean {
  return brRegex.test(url);
}

function BrM3u8ToMp4(url: string): string[] {
  const match = brRegex.exec(url);

  if (match == null) {
    throw new Error('invalid url');
  }

  const [, , qualitiesString] = match;
  const qualities = qualitiesString.split(',');
  const mp4s = qualities.map((quality) => `http://cdn-storage.br.de/${match[1]}${quality}.mp4`);

  return mp4s;
}
