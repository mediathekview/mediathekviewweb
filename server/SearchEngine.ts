
import elasticsearch from 'elasticsearch';
import { arraysHasSameElements, timeout } from './utils';

export default class SearchEngine {
  client: elasticsearch.Client;

  constructor(elasticsearchSettings) {
    console.log(elasticsearchSettings);

    this.client = new elasticsearch.Client(elasticsearchSettings);
  }

  async waitForConnection(): Promise<void> {
    let success = false;

    do {
      try {
        await this.client.ping({ requestTimeout: 250 });
        success = true;
        console.info('connected to elasticsearch');
      } catch (error) {
        console.warn(`couldn't connect to elasticsearch, trying again...`)
        console.error(error);
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
      if (!response.found) {
        callback('document not found');
      } else if (err) {
        callback('error: ' + response);
        console.error(response);
      } else {
        callback((response._source as any).description);
      }
    });
  }

  search(query, callback) {
    let queryErrors = [];

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

      for (var i = 0; i < queries.length; i++) {
        let match = this.createMultiMatch(queries[i].fields, queries[i].query, 'and');

        let found = false;
        for (var j = 0; j < fieldsBasedQueries.length; j++) {
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
        let result = [];

        for (let i = 0; i < response.hits.hits.length; i++) {
          let entry = response.hits.hits[i]._source as any;
          entry.id = response.hits.hits[i]._id;

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
