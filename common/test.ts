import { Query, MultiMatch, RangeMatch, AllMatch, Operator, Occurrence, SortMode, SortOrder, Field } from './query';
import * as Elasticsearch from 'elasticsearch';

let elasticsearch = new Elasticsearch.Client({ host: 'localhost:9200' });


let query = new Query();

query
  .index('test_data')
  .type('test_type')
  .skip(5)
  .limit(10)
//.sort('age', SortOrder.Ascending)

query.match(Occurrence.Must, new RangeMatch('age', { lte: 1000 }));

let elasticQuery = query.buildQuery();

elasticsearch.search(elasticQuery, (err, result) => {
  elasticsearch.search(elasticQuery, (err, result) => {
    elasticsearch.search(elasticQuery, (err, result) => {
      elasticsearch.search(elasticQuery, (err, result) => {
        elasticsearch.search(elasticQuery, (err, result) => {
          elasticsearch.search(elasticQuery, (err, result) => {
          });
        });
      });
    });
  });
});


setTimeout(() => {
  const NS_PER_SEC = 1e9;
  const time = process.hrtime();
  elasticsearch.search(elasticQuery, (err, result) => {
    const diff = process.hrtime(time);
    console.log(`Benchmark took ${(diff[0] * NS_PER_SEC + diff[1]) / 1000 / 1000} milliseconds`);

    console.log(JSON.stringify(err, null, 2));
    console.log(result);
  });
}, 2000);
