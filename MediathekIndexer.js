const EventEmitter = require('events');
const cp = require('child_process');
const os = require('os');
const IPC = require('./IPC.js');
const REDIS = require('redis');
const moment = require('moment');
const lodash = require('lodash');
const lineReader = require('line-reader');
const elasticsearch = require('elasticsearch');
const request = require('request');

const cpuCount = os.cpus().length;
const workerArgs = process.execArgv.concat(['--optimize_for_size', '--memory-reducer']);

class MediathekIndexer extends EventEmitter {
    constructor(workerCount, redisSettings, elasticsearchSettings) {
        super();

        this.options = {};
        this.options.workerCount = workerCount == 'auto' ? cpuCount : workerCount;
        this.options.redisSettings = redisSettings;
        this.options.elasticsearchSettings = JSON.stringify(elasticsearchSettings);

        this.redis = REDIS.createClient(this.options.redisSettings);
        this.searchClient = new elasticsearch.Client(JSON.parse(this.options.elasticsearchSettings));

        this.handleStateInterval = null;
        this.emitStateInterval = null;

        this.indexingCompleteCallback = null;
        this.indexingErrorCallback = null;
        this.errorMessage = null;
    }

    handleError(error) {
        clearInterval(this.handleStateInterval);
        clearInterval(this.emitStateInterval);

        console.error(error);
        this.errorMessage = error.message;
        this.emitState();

        if (typeof(this.indexingErrorCallback) == 'function') {
            this.indexingErrorCallback();
        }
    }

    init() {
        this.indexers = [];
        this.indexersState = new Array(this.options.workerCount);
        this.totalEntries = 0;
        this.parserProgress = 0;
        this.indexBegin = 0;
        this.workersState = {};
        this.indexingDone = false;
    }

    getFilmlisteTimestamp(callback) {
        this.redis.get('filmlisteTimestamp', (err, reply) => {
            if (!err) {
                callback(reply);
            } else {
                callback(0);
            }
        });
    }

    getIndexCompleted(callback) {
        this.redis.get('indexCompleted', (err, reply) => {
            if (!err) {
                callback(reply === 'true');
            } else {
                callback(false);
            }
        });
    }

    checkUpdateAvailable(callback) {
        this.getIndexCompleted((indexCompleted) => {
            this.getRandomFilmlisteMirror((mirror) => {
                if (!indexCompleted) {
                    callback(true, mirror);
                } else {
                    this.getFilmlisteTimestamp((filmlisteTimestamp) => {
                        request.head(mirror, (error, response, body) => {
                            var lastModified = Math.floor(new Date(response.headers['last-modified']).getTime() / 1000);
                            let tolerance = 15 * 60; //15 minutes
                            callback((lastModified - filmlisteTimestamp) >= tolerance, mirror);
                        });
                    });
                }
            });
        });
    }

    getRandomFilmlisteMirror(callback) {
        request.get('https://res.mediathekview.de/akt.xml', (error, response, body) => {
            if (!error && response.statusCode == 200) {
                let filmlisteUrlRegex = /<URL>\s*(.*?)\s*<\/URL>/g;
                let urlMatches = [];

                let match;
                while ((match = filmlisteUrlRegex.exec(body)) !== null) {
                    urlMatches.push(match);
                }

                let url = urlMatches[Math.floor(Math.random() * urlMatches.length)][1];

                callback(url);
            } else {
                callback(null);
            }
        });
    }

    indexFile(file, indexingCompleteCallback, indexingErrorCallback) {
        if (this.indexing) {
            throw new Error('already indexing');
        }

        this.init();

        this.file = file;
        this.indexingCompleteCallback = indexingCompleteCallback;
        this.indexingErrorCallback = indexingErrorCallback;
        this.indexBegin = Date.now();

        this.emitStateInterval = setInterval(() => this.emitState(), 500);
        this.handleStateInterval = setInterval(() => this.handleState(), 500);

        this.searchClient.indices.delete({
            index: 'filmliste'
        }, (err, resp, status) => {
            if (err) {
                this.handleError(err);
            } else {
                this.searchClient.indices.create({
                    index: 'filmliste'
                }, (err, resp, status) => {
                    if (err) {
                        this.handleError(err);
                    } else {
                        this.searchClient.indices.close({
                            index: 'filmliste'
                        }, (err, resp, status) => {
                            if (err) {
                                this.handleError(err);
                            } else {
                                this.putSettings((err, resp, status) => {
                                    if (err) {
                                        this.handleError(err);
                                    } else {
                                        this.putMapping((err, resp, status) => {
                                            if (err) {
                                                this.handleError(err);
                                            } else {
                                                this.searchClient.indices.open({
                                                    index: 'filmliste'
                                                }, (err, resp, status) => {
                                                    if (err) {
                                                        this.handleError(err);
                                                    } else {
                                                        this.redis.flushdb(() => this.startWorkers());
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    putMapping(callback) {
        this.searchClient.indices.putMapping({
            index: 'filmliste',
            type: 'entries',
            body: {
                properties: {
                    channel: {
                        type: 'text',
                        index: 'true',
                        analyzer: 'mvw_index_analyzer',
                        search_analyzer: 'mvw_search_analyzer'
                    },
                    topic: {
                        type: 'text',
                        index: 'true',
                        analyzer: 'mvw_index_analyzer',
                        search_analyzer: 'mvw_search_analyzer'
                    },
                    title: {
                        type: 'text',
                        index: 'true',
                        analyzer: 'mvw_index_analyzer',
                        search_analyzer: 'mvw_search_analyzer'
                    },
                    description: {
                        type: 'string',
                        index: 'no'
                    },
                    timestamp: {
                        type: 'date',
                        format: 'epoch_second',
                        index: 'true',
                    },
                    duration: {
                        type: 'long',
                        index: 'false'
                    },
                    size: {
                        type: 'long',
                        index: 'false'
                    },
                    url_video: {
                        type: 'string',
                        index: 'no'
                    },
                    url_website: {
                        type: 'string',
                        index: 'no'
                    },
                    url_video_low: {
                        type: 'string',
                        index: 'no'
                    },
                    url_video_hd: {
                        type: 'string',
                        index: 'no'
                    }
                }
            }
        }, (err, resp, status) => {
            callback(err, resp, status);
        });
    }

    putSettings(callback) {
        this.searchClient.indices.putSettings({
            index: 'filmliste',
            body: {
                refresh_interval: '-1',
                analysis: {
                    analyzer: {
                        mvw_index_analyzer: {
                            type: 'custom',
                            tokenizer: 'mvw_tokenizer',
                            char_filter: ['toLatin'],
                            filter: [
                                'lowercase',
                                'asciifolding'
                            ]
                        },
                        mvw_search_analyzer: {
                            type: 'custom',
                            tokenizer: 'standard',
                            char_filter: ['toLatin'],
                            filter: [
                                'lowercase',
                                'asciifolding'
                            ]
                        }
                    },
                    tokenizer: {
                        mvw_tokenizer: {
                            type: 'edge_ngram',
                            min_gram: 1,
                            max_gram: 25,
                            token_chars: [
                                'letter',
                                'digit'
                            ]
                        }
                    },
                    filter: {
                        asciifoldingpreserveorig: {
                            type: 'asciifolding',
                            'preserve_original': true
                        }
                    },
                    char_filter: {
                        toLatin: {
                            type: 'mapping',
                            mappings: [
                                'ä => ae',
                                'ö => oe',
                                'ü => ue',
                                'ù => u',
                                'û => u',
                                'ÿ => y',
                                'à => a',
                                'â => a',
                                'æ => ae',
                                'ç => c',
                                'é => e',
                                'è => e',
                                'ê => e',
                                'ë => e',
                                'ï => i',
                                'î => i',
                                'ô => o',
                                'œ => oe',
                                'ß => ss'
                            ]
                        }
                    }
                }
            }
        }, (err, resp, status) => {
            callback(err, resp, status);
        });
    }

    startWorkers() {
        let filmlisteParser = cp.fork('./FilmlisteParser.js', {
            execArgv: workerArgs
        });

        let parserIpc = new IPC(filmlisteParser);

        parserIpc.on('ready', () => {
            parserIpc.on('state', (state) => {
                this.totalEntries = state.entries;
                this.parserProgress = state.progress;
            });
            parserIpc.send('parseFilmliste', {
                file: this.file,
                redisSettings: this.options.redisSettings
            });

            for (let i = 0; i < this.options.workerCount; i++) {
                this.startIndexer();
            }
        });
    }

    startIndexer() {
        let indexer = cp.fork('./MediathekIndexerWorker.js', {
            execArgv: workerArgs
        });
        var ipcIndexer = new IPC(indexer);

        ipcIndexer.on('ready', () => {
            ipcIndexer.send('init', {
                redisSettings: this.options.redisSettings,
                elasticsearchSettings: JSON.parse(this.options.elasticsearchSettings),
                index: 'filmliste'
            });
        });

        ipcIndexer.on('initialized', () => {
            ipcIndexer.send('index');
        });

        ipcIndexer.on('error', (err) => {
            this.handleError(err);
        });

        let indexerIndex = this.indexers.length;

        ipcIndexer.on('state', (state) => {
            this.indexersState[indexerIndex] = state;
        });

        this.indexers.push({
            indexer: indexer,
            entries: 0,
            time: 0,
            done: false
        });
    }

    combineWorkerStates() {
        let entries = 0;
        let done = true;

        for (let i = 0; i < this.indexersState.length; i++) {
            if (this.indexersState[i] != undefined) {
                entries += this.indexersState[i].entries;

                if (this.indexersState[i].done == false) {
                    done = false;
                }
            } else {
                done = false;
            }
        }

        return {
            entries: entries,
            done: done
        };
    }

    handleState() {
        this.workersState = this.combineWorkerStates();
        let workersDone = this.workersState.done && (this.parserProgress == 1);

        if (workersDone) {
            clearInterval(this.handleStateInterval);

            this.searchClient.indices.putSettings({
                index: 'filmliste',
                body: {
                    refresh_interval: '5s'
                }
            }, (err, resp, status) => {
                if (err) {
                    this.handleError(err);
                } else {
                    this.searchClient.indices.refresh({
                        index: 'filmliste'
                    }, (err, resp, status) => {
                        if (err) {
                            handleError(err);
                        } else {
                            this.indexComplete();
                        }
                    });
                }
            });
        }
    }

    indexComplete() {
        this.redis.batch().set('indexTimestamp', Math.floor(Date.now() / 1000))
            .set('indexCompleted', true)
            .exec((err, replies) => {
                clearInterval(this.emitStateInterval);
                this.indexingDone = true;
                this.emitState();

                if (typeof(this.indexingCompleteCallback) == 'function') {
                    this.indexingCompleteCallback();
                }
            });
    }

    emitState() {
        this.emit('state', {
            parserProgress: this.parserProgress,
            indexingProgress: this.workersState.entries / (this.totalEntries / this.parserProgress),
            totalEntries: this.totalEntries,
            entries: this.workersState.entries,
            time: Date.now() - this.indexBegin,
            done: this.indexingDone,
            error: this.errorMessage
        });
    }
}

module.exports = MediathekIndexer;
