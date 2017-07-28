import { Query, MultiMatch, RangeMatch, AllMatch, Operator, Occurrence, SortMode, SortOrder, Field } from './query';
import * as Elasticsearch from 'elasticsearch';

let elasticsearch = new Elasticsearch.Client({ host: 'localhost:9200' });

let query = new Query();

query
  .index('filmliste')
  .type('entries')
  .skip(0)
  .limit(5)
.sort('timestamp', SortOrder.Descending)

query.match(Occurrence.Must, new MultiMatch('sturm der liebe', ['title', 'topic'], { }));

let elasticQuery = query.buildQuery();

console.log(JSON.stringify(elasticQuery, null, 2))

setTimeout(() => {
  const NS_PER_SEC = 1e9;
  const time = process.hrtime();
  elasticsearch.search(elasticQuery, (err, result) => {
    const diff = process.hrtime(time);
    console.log(`Benchmark took ${(diff[0] * NS_PER_SEC + diff[1]) / 1000 / 1000} milliseconds`);

    console.log(JSON.stringify(err, null, 2));
    console.log(JSON.stringify(result, null, 2));
  });
}, 2000);
