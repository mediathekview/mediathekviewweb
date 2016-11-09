var REDIS = require('redis');

class SearchEngine {
    constructor() {
        this.searchIndex = REDIS.createClient({
            host: host,
            port: port,
            password: password,
            db: 0
        });

        this.searchIndex.on('error', (err) => {
            console.log('SearchEngine error: ' + err);
        });

        this.indexData = REDIS.createClient({
            host: host,
            port: port,
            password: password,
            db: 1
        });

        this.indexData.on('error', (err) => {
            console.log('SearchEngine error: ' + err);
        });
    }

    search(query, mode, minWordSize, callback) {
        let splits = query.trim().toLowerCase().split(' ').filter((split) => {
            return split.length >= minWordSize;
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
