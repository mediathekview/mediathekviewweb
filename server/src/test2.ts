import * as Elasticsearch from 'elasticsearch';

import { AggregatedEntry, SearchQuery } from './common/api';
import { SearchStringParser } from './common/search-string-parser/parser';
import { ElasticsearchMapping, ElasticsearchSettings } from './elasticsearch-definitions';
import { ElasticsearchSearchEngine } from './search-engine/elasticsearch';
import { TextQueryBuilder, MatchAllQueryBuilder } from './common/search-engine/query/builder';
import { Field } from './common/model';
import { RedisLockProvider } from './lock/redis';
import * as Redis from 'ioredis';
import { EventLoopWatcher } from './utils';

const INDEX_NAME = 'mediathekviewweb';
const TYPE_NAME = 'entry';

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

  const query = parser.parse('channel:ARD title:tagesschau ^title:gebärdensprache');

  const queryString = JSON.stringify(query, null, 1);

  const searchQuery: SearchQuery = {
    body: query
  };

  try {
    const result = await entrySearchEngine.search(searchQuery);
    console.log(result.items.map((item) => item.title));
  }
  catch (error) {
    console.error(error);
  }

})();