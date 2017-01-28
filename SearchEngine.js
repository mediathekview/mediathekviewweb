const utils = require('./utils.js');
const elasticsearch = require('elasticsearch');

class SearchEngine {
    constructor(elasticsearchSettings) {
        this.searchClient = new elasticsearch.Client(elasticsearchSettings);
    }

    isBooleanString(str) {
        if (typeof str != 'string')
            return false;

        return /^(false|true)$/.test(str);
    }
    isIntegerString(str) {
        if (typeof str != 'string')
            return false;

        return /^\d+$/.test(str);
    }

    search(q, callback) {
        let queryErrors = [];

        if (q.queryString !== undefined && typeof q.queryString != 'string') {
            queryErrors.push('type of queryString must be string');
        }

        if (q.searchTopic !== undefined && typeof q.searchTopic != 'string' && typeof q.searchTopic != 'boolean') {
            queryErrors.push('type of searchTopic must be string or boolean');
        } else if (q.searchTopic !== undefined && typeof q.searchTopic == 'string' && /^(false|true|auto)$/.test(q.searchTopic) == false) {
            queryErrors.push('value of searchTopic must be \'true\', \'false\', \'auto\' or a boolean');
        }

        if (this.isBooleanString(q.future)) {
            if (q.future === 'true') {
                q.future = true;
            } else if (q.future === 'false') {
                q.future = false;
            }
        }
        if (q.future !== undefined && typeof q.future != 'boolean') {
            queryErrors.push('type of future must be boolean');
        }

        if (this.isIntegerString(q.from)) {
          q.from = parseInt(q.from);
        }
        if (q.from !== undefined && typeof q.from != 'number') {
            queryErrors.push('type of from must be number');
        } else if (q.from !== undefined && (q.from % 1) != 0) {
            queryErrors.push('value of from must be an integer');
        }

        if (this.isIntegerString(q.size)) {
          q.size = parseInt(q.size);
        }
        if (q.size !== undefined && typeof q.size != 'number') {
            queryErrors.push('type of size must be number');
        } else if (q.size !== undefined && (q.size % 1) != 0) {
            queryErrors.push('value of size must be an integer');
        }

        if (this.isIntegerString(q.size)) {
          q.size = parseInt(q.size);
        }
        if (q.size !== undefined && typeof q.size != 'number') {
            queryErrors.push('type of size must be number');
        } else if (q.size !== undefined && (q.size % 1) != 0) {
            queryErrors.push('value of size must be an integer');
        }

        if (this.isBooleanString(q.fuzzy)) {
            if (q.fuzzy === 'true') {
                q.fuzzy = true;
            } else if (q.fuzzy === 'false') {
                q.fuzzy = false;
            }
        }
        if (q.fuzzy !== undefined && typeof q.fuzzy != 'boolean') {
            queryErrors.push('type of fuzzy must be boolean');
        }

        if (queryErrors.length > 0) {
            callback(null, queryErrors);
            return;
        }

        let query = {
            queryString: (q.queryString === undefined) ? '' : q.queryString,
            searchTopic: (q.searchTopic === undefined) ? 'auto' : q.searchTopic,
            future: (q.future === undefined) ? true : q.future,
            from: (q.from === undefined) ? 0 : q.from,
            size: (q.size === undefined) ? 10 : q.size,
            fuzzy: (q.fuzzy === undefined) ? false : q.fuzzy
        }

        let parsedQueryString = this.parseQuery(query.queryString);
        let musts = [];
        let elasticQuery = {};

        if (query.searchTopic == 'auto') {
            if (parsedQueryString.topics.length == 0) {
                query.searchTopic = true;
            } else {
                query.searchTopic = false;
            }
        } else if (query.searchTopic == 'true') {
            query.searchTopic = true;
        } else if (query.searchTopic == 'false') {
            query.searchTopic = false;
        }

        if (parsedQueryString.channels.length == 0 && parsedQueryString.topics.length == 0 && parsedQueryString.titleParts.length == 0) {
            elasticQuery = this.createFilter(query.future);
        } else {
            let filter = this.createFilter(query.future);
            let channelMatches = [];
            for (let i = 0; i < parsedQueryString.channels.length; i++) {
                channelMatches.push({
                    match: {
                        channel: {
                            query: parsedQueryString.channels[i].join(' '),
                            operator: 'and'
                        }
                    }
                });
            }

            musts.push({
                bool: {
                    should: channelMatches
                }
            });

            let topicMatches = [];
            for (let i = 0; i < parsedQueryString.topics.length; i++) {
                topicMatches.push({
                    match: {
                        topic: {
                            query: parsedQueryString.topics[i].join(' '),
                            operator: 'and',
                            fuzziness: query.fuzzy ? 'auto' : 0
                        }
                    }
                });
            }

            musts.push({
                bool: {
                    should: topicMatches
                }
            });

            if (parsedQueryString.titleParts.length > 0) {
                if (query.searchTopic) {
                    musts.push({
                        bool: {
                            should: [{
                                match: {
                                    title: {
                                        query: parsedQueryString.titleParts.join(' '),
                                        operator: 'and',
                                        fuzziness: query.fuzzy ? 'auto' : 0
                                    }
                                }
                            }, {
                                match: {
                                    topic: {
                                        query: parsedQueryString.titleParts.join(' '),
                                        operator: 'and',
                                        fuzziness: query.fuzzy ? 'auto' : 0
                                    }
                                }
                            }]
                        }
                    });
                } else {
                    musts.push({
                        match: {
                            title: {
                                query: parsedQueryString.titleParts.join(' '),
                                operator: 'and',
                                fuzziness: query.fuzzy ? 'auto' : 0
                            }
                        }
                    });
                }
            }

            elasticQuery = {
                bool: {
                    must: musts,
                    filter: filter
                }
            };
        }

        this.searchClient.search({
            index: 'filmliste',
            type: 'entries',
            from: query.from,
            size: query.size,
            body: {
                query: elasticQuery,
                sort: {
                    timestamp: {
                        order: "desc"
                    },
                    _score: {
                        order: "desc"
                    }
                }
            }
        }, (error, response, status) => {
            if (error) {
                callback(null, [error]);
            } else {
                let result = [];

                for (let i = 0; i < response.hits.hits.length; i++) {
                    result.push(response.hits.hits[i]._source);
                }

                callback({
                    result: result,
                    totalResults: response.hits.total
                }, null);
            }
        });
    }

    createFilter(includeFuture) {
        let filter = {};

        if (!includeFuture) {
            filter.range = {
                timestamp: {
                    to: 'now+1h/h'
                }
            }
        }

        return filter;
    }

    parseQuery(query) {
        let channels = [];
        let topics = [];
        let titleParts = [];

        let splits = query.trim().toLowerCase().split(/\s+/).filter((split) => {
            return (split.length > 0);
        });

        for (let i = 0; i < splits.length; i++) {
            let split = splits[i];

            if (split[0] == '!') {
                let c = split.slice(1, split.length).split(',').filter((split) => {
                    return (split.length > 0);
                });
                if (c.length > 0) {
                    channels.push(c);
                }
            } else if (split[0] == '#') {
                let t = split.slice(1, split.length).split(',').filter((split) => {
                    return (split.length > 0);
                });
                if (t.length > 0) {
                    topics.push(t);
                }
            } else {
                titleParts = titleParts.concat(split.split(/\s+/));
            }
        }

        return {
            channels: channels,
            topics: topics,
            titleParts: titleParts
        }
    }
}

module.exports = SearchEngine;
