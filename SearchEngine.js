const utils = require('./utils.js');
const elasticsearch = require('elasticsearch');

class SearchEngine {
    constructor(elasticsearchSettings) {
        this.searchClient = new elasticsearch.Client({
            host: 'localhost:9200'
        });
    }

    search(q, searchTopic, future, callback) {
        let query = this.parseQuery(q);

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
            callback({
                result: [],
                totalResults: 0
            });
            return;
        }

        let filter = {};
        if (!future) {
            filter.range = {
                timestamp: {
                    lte: Math.floor(Date.now() / 1000)
                }
            }
        }


        let musts = [];

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

        this.searchClient.search({
            index: 'filmliste',
            type: 'entries',
            size: 50,
            body: {
                query: {
                    bool: {
                        must: musts,
                        filter: filter
                    }
                },
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
