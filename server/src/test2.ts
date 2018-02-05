import * as Elasticsearch from 'elasticsearch';

import { AggregatedEntry, SearchQuery } from './common/api';
import { SearchStringParser } from './common/search-string-parser/parser';
import { ElasticsearchMapping, ElasticsearchSettings } from './elasticsearch-definitions';
import { ElasticsearchSearchEngine } from './search-engine/elasticsearch';
import { TextQueryBuilder, MatchAllQueryBuilder } from './common/search-engine/query/builder';
import { Field } from './common/model';

const elasticsearch = new Elasticsearch.Client({});
const entrySearchEngine = new ElasticsearchSearchEngine<AggregatedEntry>(elasticsearch, 'mediathekviewweb', 'entry', ElasticsearchSettings, ElasticsearchMapping);


(async () => {
  await entrySearchEngine.initialize();


  const parser = new SearchStringParser();

  const query = parser.parse('channel:NDR');//duration:30s-2m duration:>=40m

  const queryString = JSON.stringify(query, null, 1);

  const searchQuery: SearchQuery = {
    body: new MatchAllQueryBuilder().build()
  }

  try {
    const result = await entrySearchEngine.search(searchQuery);
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }

})();