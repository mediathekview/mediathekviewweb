var REDIS = require('redis');

class SearchEngine {
    constructor(host = '127.0.0.1', port = 6379, password = '', db1, db2) {
        this.searchIndex = REDIS.createClient({
            host: host,
            port: port,
            password: password,
            db: db1
        });

        this.searchIndex.on('error', (err) => {
            console.log('SearchEngine error: ' + err);
        });

        this.indexData = REDIS.createClient({
            host: host,
            port: port,
            password: password,
            db: db2
        });

        this.indexData.on('error', (err) => {
            console.log('SearchEngine error: ' + err);
        });
    }

    search(query, minWordSize, mode, callback) {
        let splits = query.trim().toLowerCase().split(' ').filter((split) => {
            return split.length >= minWordSize;
        });

        if (splits.length == 0) {
            callback([]);
            return;
        }

        if (mode == 'or') {
            this.getSets(splits, (sets) => {

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
                    let commands = [];

                    for (let i = 0; i < keys.length; i++) {
                        commands.push(['hgetall', keys[i]]);
                    }

                    this.indexData.batch(commands).exec((err, reply) => {
                        let result = [];

                        for (var i = 0; i < reply.length; i++) {
                            result.push({
                                data: reply[i],
                                relevance: hits[keys[i]]
                            });
                        }
                        callback(result);
                    });
                }

                callback([]);
            });

        } else if (mode == 'and') {
            this.searchIndex.sinter(splits, (err, reply) => {
                if (err) {
                    callback(null, err);
                    return;
                }

                let commands = [];

                for (let i = 0; i < reply.length; i++) {
                    commands.push(['hgetall', reply[i]]);
                }

                this.indexData.batch(commands).exec((err, reply) => {
                    let result = [];

                    for (var i = 0; i < reply.length; i++) {
                        result.push({
                            data: reply[i],
                            relevance: 1
                        });
                    }
                    callback(result);
                });
            });
        } else {
            throw Error('mode is neither or nor and');
        }
    }

    getSets(keys, callback, result, i = 0) {
        if (result === undefined) result = [];

        if (keys[i] == undefined)
        throw Error();

        this.searchIndex.smembers(keys[i], (err, reply) => {
            if (err) callback(null, err);
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
