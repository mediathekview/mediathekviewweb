import { BoolQueryBuilder, RangeQueryBuilder, TextQueryBuilder, TimeQueryValueBuilder, MatchAllQueryBuilder, TimeUnit, Query } from './query';
import * as Elasticsearch from 'elasticsearch';
import { ElasticsearchSearchEngine } from '../search-engine/elasticsearch';
import { IEntry } from '../common';

const topicTitleQueryBuilder = new TextQueryBuilder().fields('topic', 'title').text('sturm der liebe');
const channelAQueryBuilder = new TextQueryBuilder().fields('channel').text('ndr');
const channelBQueryBuilder = new TextQueryBuilder().fields('channel').text('ndr');
const channelQueryBuilder = new BoolQueryBuilder().should(channelAQueryBuilder, channelBQueryBuilder);


const boolQueryBuilder = new BoolQueryBuilder().must(topicTitleQueryBuilder, channelQueryBuilder).filter();

const elasticsearchClient = new Elasticsearch.Client({ host: '127.0.0.1:9200' });

const searchEngine = new ElasticsearchSearchEngine<IEntry>('mediathekviewweb', 'entry', elasticsearchClient);


const query: Query = {
  body: new MatchAllQueryBuilder().build(),
  sorts: [{
    field: 'timestamp',
    order: 'descending'
  }]
};

(async () => {

  const result = await searchEngine.search(query);

  console.log(result);

})();
