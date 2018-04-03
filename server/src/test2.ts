import * as Elasticsearch from 'elasticsearch';
import * as Redis from 'ioredis';

import { AggregatedEntry } from './common/model';
import { SearchQuery } from './common/search-engine';
import { SearchStringParser } from './common/search-string-parser/parser';
import { ElasticsearchMapping, ElasticsearchSettings } from './elasticsearch-definitions';
import { RedisLockProvider } from './lock/redis';
import { ElasticsearchSearchEngine } from './search-engine/elasticsearch';

const INDEX_NAME = 'mediathekviewweb';
const TYPE_NAME = 'entry';

const parser = new SearchStringParser();

const query = parser.parse('channel:ARD title:tagesschau ^title:gebärdensprache duration:55m-2h');

const queryString = JSON.stringify(query, null, 1);

const searchQuery: SearchQuery = {
  body: query
};

console.log(JSON.stringify(searchQuery, null, 2));

process.exit(0);

const elasticsearch = new Elasticsearch.Client({
  log: [{
    type: 'stdio',
    levels: ['error']
  }]
});

const redis = new Redis();
const lockProvider = new RedisLockProvider(redis);

const entrySearchEngine = new ElasticsearchSearchEngine<AggregatedEntry>(elasticsearch, INDEX_NAME, TYPE_NAME, ElasticsearchSettings, ElasticsearchMapping);


(async () => {
  const lockKey = `elasticsearch:${INDEX_NAME}:${TYPE_NAME}`;

  const lock = lockProvider.get(lockKey);
  const success = await lock.acquire(5000, async () => {
    await entrySearchEngine.initialize();
  });

  if (!success) {
    throw new Error('failed acquiring lock');
  }

  const parser = new SearchStringParser();

  const query = parser.parse('channel:ARD title:tagesschau ^title:gebärdensprache duration:55m-2h');

  const queryString = JSON.stringify(query, null, 1);

  const searchQuery: SearchQuery = {
    body: query
  };

  console.log(searchQuery);

  if (1 == 1) throw '';

  try {
    const result = await entrySearchEngine.search(searchQuery);
    console.log(result.items.map((item) => item.title));
  }
  catch (error) {
    console.error(error);
  }

})();