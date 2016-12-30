const utils = require('./utils.js');
const elasticsearch = require('elasticsearch');

class SearchEngine {
    constructor(elasticsearchSettings) {
        this.searchClient = new elasticsearch.Client({
            host: 'localhost:9200'
        });
    }

    search(q, searchTopic, future, from = 0, size = 10, callback) {
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
            elasticQuery = this.createFilter(false);
        } else {
            let filter = this.createFilter(future);
            let channelMatches = [];
            for (let i = 0; i < query.channels.length; i++) {
                channelMatches.push({
                    match: {
                        channel: {
                            query: query.channels[i].join(' '),
                            operator: 'and',
                            fuzziness: 'auto'
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
                            fuzziness: 'auto'
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
                                        fuzziness: 'auto'
                                    }
                                }
                            }, {
                                match: {
                                    topic: {
                                        query: query.titleParts.join(' '),
                                        operator: 'and',
                                        fuzziness: 'auto'
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
                                fuzziness: 'auto'
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
                console.log("search error: " + error)
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
                    lte: Math.floor(Date.now() / 1000)
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
            return !!split;
        });

        for (let i = 0; i < splits.length; i++) {
            let split = splits[i];

            if (split[0] == '!') {
                channels.push(split.slice(1, split.length).split(',').filter((split) => {
                    return !!split;
                }));
            } else if (split[0] == '#') {
                topics.push(split.slice(1, split.length).split(',').filter((split) => {
                    return !!split;
                }));
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
