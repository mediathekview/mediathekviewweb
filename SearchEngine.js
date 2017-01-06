const utils = require('./utils.js');
const elasticsearch = require('elasticsearch');

class SearchEngine {
    constructor(elasticsearchSettings) {
        this.searchClient = new elasticsearch.Client(elasticsearchSettings);
    }

    search(q, searchTopic, future, from = 0, size = 10, fuzzy = false, callback) {
        let query = this.parseQuery(q);
        let musts = [];
        let elasticQuery = {};

        if (searchTopic == 'auto') {
            if (query.topics.length == 0) {
                searchTopic = true;
            } else {
                searchTopic = false;
            }
        } else if (searchTopic == 'true') {
            searchTopic = true;
        } else if (searchTopic == 'false') {
            searchTopic = false;
        }

        if (query.channels.length == 0 && query.topics.length == 0 && query.titleParts.length == 0) {
            elasticQuery = this.createFilter(future);
        } else {
            let filter = this.createFilter(future);
            let channelMatches = [];
            for (let i = 0; i < query.channels.length; i++) {
                channelMatches.push({
                    match: {
                        channel: {
                            query: query.channels[i].join(' '),
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
            for (let i = 0; i < query.topics.length; i++) {
                topicMatches.push({
                    match: {
                        topic: {
                            query: query.topics[i].join(' '),
                            operator: 'and',
                            fuzziness: fuzzy ? 'auto' : 0
                        }
                    }
                });
            }

            musts.push({
                bool: {
                    should: topicMatches
                }
            });

            if (query.titleParts.length > 0) {
                if (searchTopic) {
                    musts.push({
                        bool: {
                            should: [{
                                match: {
                                    title: {
                                        query: query.titleParts.join(' '),
                                        operator: 'and',
                                        fuzziness: fuzzy ? 'auto' : 0
                                    }
                                }
                            }, {
                                match: {
                                    topic: {
                                        query: query.titleParts.join(' '),
                                        operator: 'and',
                                        fuzziness: fuzzy ? 'auto' : 0
                                    }
                                }
                            }]
                        }
                    });
                } else {
                    musts.push({
                        match: {
                            title: {
                                query: query.titleParts.join(' '),
                                operator: 'and',
                                fuzziness: fuzzy ? 'auto' : 0
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
            from: from,
            size: size,
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
                console.error("search error: " + error)
            } else {
                let result = [];

                for (let i = 0; i < response.hits.hits.length; i++) {
                    result.push(response.hits.hits[i]._source);
                }

                callback({
                    result: result,
                    totalResults: response.hits.total
                });
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
