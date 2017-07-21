"use strict";
exports.__esModule = true;
var query_1 = require("./query");
var Elasticsearch = require("elasticsearch");
var elasticsearch = new Elasticsearch.Client({ host: 'localhost:9200' });
var query = new query_1.Query();
query
    .index('test_data')
    .type('test_type')
    .skip(5)
    .limit(10);
//.sort('age', SortOrder.Ascending)
query.match(query_1.Occurrence.MustNot, new query_1.AllMatch());
var elasticQuery = query.buildQuery();
setTimeout(function () {
    var NS_PER_SEC = 1e9;
    var time = process.hrtime();
    elasticsearch.search(elasticQuery, function (err, result) {
        var diff = process.hrtime(time);
        console.log("Benchmark took " + (diff[0] * NS_PER_SEC + diff[1]) / 1000 / 1000 + " milliseconds");
        console.log(JSON.stringify(err, null, 2));
        console.log(result);
    });
}, 1000);
