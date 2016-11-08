var HashTable = require('hashtable');
var REDIS = require('redis');
var underscore = require('underscore');

var redis = REDIS.createClient();

redis.on("error", function(err) {
    console.log("Error " + err);
});

const skipsadd = false;

const MIN_WORD_SIZE = 4;

class SearchEngine {
    constructor() {
        this.counter = 0;
        this.indexData = {};
        //this.searchindex = new Map();
        //this.searchindex = new HashTable();

        redis.flushdb();
        this.buffer = [];

        this.debouncedFlushBuffer = underscore.debounce(this.flushBuffer, 100);
    }


    add(ident, data) {
        let c = this.counter++;
        this.indexData[c] = data;

        if (!skipsadd) {
            let splits = ident.trim().replace(':', '').toLowerCase().split(' ');

            for (let i in splits) {
                let split = splits[i];

                for (let begin = 0; begin <= split.length - MIN_WORD_SIZE; begin++) {
                    for (let end = begin + MIN_WORD_SIZE; end <= split.length; end++) {
                        let key = split.slice(begin, end);

                        this.buffer.push(['sadd', key, c]);
                    }
                }
            }

            if (this.buffer.length >= 500) {
                this.flushBuffer();
            } else {
                this.debouncedFlushBuffer();
            }
        }

        //if (c % 1000 == 0) console.log('indexed ' + c + ' entries, containing ' + this.searchindex.size() + ' mapkeys');
        redis.dbsize((err, reply) => {
            if (c % 1000 == 0) console.log('indexed ' + c + ' entries, containing ' + reply + ' mapkeys');
        });
    }

    flushBuffer() {
        redis.batch(this.buffer).exec();
        this.buffer = [];
    }

    search(query, mode, callback) {
        let splits = query.trim().toLowerCase().split(' ').filter((split) => {
            return split.length >= MIN_WORD_SIZE;
        });

        if (mode == 'or') {
            this.getSets(splits, (sets) => {
                let result = [];

                if (sets.length > 0) {
                    let hits = {};

                    for (let i = 0; i < sets.length; i++) {
                        let set = sets[i];

                        for (let j = 0; j < set.length; j++) {
                            let dataIndex = set[j];

                            if (hits[dataIndex] === undefined) {
                                hits[dataIndex] = 0;
                            }

                            hits[dataIndex]++;
                        }
                    }

                    let keys = Object.keys(hits);

                    for (let i = 0; i < keys.length; i++) {
                        result.push({
                            data: this.indexData[keys[i]],
                            relevance: hits[keys[i]]
                        });
                    }
                }

                callback(result);
            });

        } else if (mode == 'and') {

            redis.sinter(splits, (err, reply) => {
                let result = [];

                for (let i = 0; i < reply.length; i++) {
                    result.push({
                        data: this.indexData[reply[i]],
                        relevance: 1
                    });
                }

                callback(result);
            });

        } else {
            throw Error('mode is neither or nor and');
        }
    }

    getSets(keys, callback, result, i = 0) {
        if (result === undefined) result = [];

        redis.smembers(keys[i], (err, reply) => {
            result[i] = reply;

            if (++i < keys.length) {
                setImmediate(() => this.getSets(keys, callback, result, i));
            } else {
                callback(result);
            }
        });
    }

    intersect(a, b) {
        let result = [];

        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < b.length; j++) {
                if (a[i] == b[j]) {
                    result.push(a[i]);
                    break;
                }
            }
        }

        return result;
    }
}

module.exports = SearchEngine;
