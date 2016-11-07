var HashTable = require('hashtable');
var REDIS = require('redis');

var redis = REDIS.createClient();

redis.on("error", function(err) {
    console.log("Error " + err);
});

var skipsadd = true;

class SearchEngine {
    constructor() {
        this.counter = 0;
        this.indexData = {};
        //this.searchindex = new Map();
        //this.searchindex = new HashTable();

        //redis.flushdb();
    }

    add(ident, data) {
        let c = this.counter++;
        this.indexData[c] = data;

        if (!skipsadd) {
            var splits = ident.trim().replace(':', '').toLowerCase().split(' ');
            //console.log(splits);

            for (let i in splits) {
                let split = splits[i];

                for (let begin = 0; begin <= split.length - 4; begin++) {
                    for (let end = begin + 4; end <= split.length; end++) {

                        let key = split.slice(begin, end);

                        /*if (!this.searchindex.has(key)) {
                            this.searchindex.put(key, new Set());
                        }

                        this.searchindex.get(key).add(c);*/

                        redis.sadd(key, c);
                    }
                }
            }
        }

        //if (c % 1000 == 0) console.log('indexed ' + c + ' entries, containing ' + this.searchindex.size() + ' mapkeys');
        redis.dbsize((err, reply) => {
            if (c % 1000 == 0) console.log('indexed ' + c + ' entries, containing ' + reply + ' mapkeys');
        });
    }

    search(query, callback) {
        var splits = query.trim().toLowerCase().split(' ');
        redis.sinter(splits, (err, reply) => {
            let result = [];

            for (var i = 0; i < reply.length; i++) {
                result.push(this.indexData[reply[i]]);
            }

            callback(result);
        });

        /*var totalMatches = [];

        for (let i in splits) {
            let split = splits[i];

            let matches = this.searchindex.get(split);
            if (matches == undefined){
              continue;
            }

            for (var dataIndex of matches) {

                if (totalMatches[dataIndex] == undefined) {
                    totalMatches[dataIndex] = 0;
                }

                totalMatches[dataIndex]++;
            }
        }

        var result = [];

        for (var i in totalMatches) {
            result.push({
                data: this.indexData[i],
                relevance: totalMatches[i]
            });
        }*/

    }
}

module.exports = SearchEngine;
