const EventEmitter = require('events');
const cp = require('child_process');
const IPC = require('./IPC.js');
const REDIS = require('redis');
const elasticsearch = require('elasticsearch');
const config = require('./config.js');
const elasticsearchDefinitions = require('./ElasticsearchDefinitions.js');
const StateEmitter = require('./StateEmitter.js');

class MediathekIndexer extends EventEmitter {
    constructor() {
        super();

        this.redis = REDIS.createClient(config.redis);
        this.searchClient = new elasticsearch.Client(config.elasticsearch);

        this.stateEmitter = new StateEmitter(this);
    }

    //path.join(config.dataDirectory, 'newFilmliste')
    indexFilmliste(file, callback) {
        this.stateEmitter.setState('step', 'indexFilmliste');
        this.hasCurrentState((err, hasCurrentState) => {
            if (err) {
                return callback(err);
            }

            if (hasCurrentState) {
                return this.deltaIndexFilmliste(file, (err) => {
                    if (err) {
                        return callback(err);
                    } 
                    this.finalize((err) => {
                        if (err) {
                            return callback(err);
                        }
                        callback(null);
                    });
                });
                
            }
            this.fullIndexFilmliste(file, (err) => {
                if (err) {
                    return callback(err);
                }
                this.finalize((err) => {
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
            });
        });
    }

    finalize(callback) {
        this.stateEmitter.setState('step', 'finalize');
        this.redis.multi()
            .rename('mediathekIndexer:newFilmliste', 'mediathekIndexer:currentFilmliste')
            .rename('mediathekIndexer:newFilmlisteTimestamp', 'mediathekIndexer:currentFilmlisteTimestamp')
            .del('mediathekIndexer:addedEntries')
            .del('mediathekIndexer:removedEntries')
            .exec((err, replies) => {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });

        this.emit('done');
        this.stateEmitter.setState('step', 'waiting');
    }

    hasCurrentState(callback) {
        this.redis.exists('mediathekIndexer:currentFilmliste', (err, reply) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, reply);
        });
    }

    fullIndexFilmliste(file, callback) {
        this.stateEmitter.setState('step', 'fullIndexFilmliste');
        this.reCreateESIndex((err) => {
            if (err) {
                return callback(err);
            }
            this.parseFilmliste(file, 'mediathekIndexer:newFilmliste', 'mediathekIndexer:newFilmlisteTimestamp', (err) => {
                if (err) {
                    return callback(err);
                }
                this.createDelta('mediathekIndexer:newFilmliste', 'mediathekIndexer:none', (err) => {
                    if (err) {
                        return callback(err);
                    }
                    this.indexDelta((err) => {
                        if (err) {
                            return callback(err);
                        }
                        callback(null);
                    });
                });
            });
        });
    }

    reCreateESIndex(callback) {
        this.stateEmitter.setState('step', 'reCreateESIndex');
        this.searchClient.indices.delete({
            index: 'filmliste'
        }, (err, resp, status) => {
            if (err && err.status != 404) { //404 (index not found) is fine, as we'll create the index in next step.
                return callback(err);
            } 
            this.searchClient.indices.create({
                index: 'filmliste'
            }, (err, resp, status) => {
                if (err) {
                    return callback(err);
                } 
                this.searchClient.indices.close({
                    index: 'filmliste'
                }, (err, resp, status) => {
                    if (err) {
                        return callback(err);
                    }
                    this.searchClient.indices.putSettings({
                        index: 'filmliste',
                        body: elasticsearchDefinitions.settings
                    }, (err, resp, status) => {
                        if (err) {
                            return callback(err);
                        }
                        this.searchClient.indices.putMapping({
                            index: 'filmliste',
                            type: 'entries',
                            body: elasticsearchDefinitions.mapping
                        }, (err, resp, status) => {
                            if (err) {
                                return callback(err);
                            }
                            this.searchClient.indices.open({
                                index: 'filmliste'
                            }, (err, resp, status) => {
                                if (err) {
                                    return callback(err);
                                }
                                callback(null);
                            });
                        });
                    });
                });
            });
        });
    }

    deltaIndexFilmliste(file, callback) {
        this.stateEmitter.setState('step', 'deltaIndexFilmliste');
        this.parseFilmliste(file, 'mediathekIndexer:newFilmliste', 'mediathekIndexer:newFilmlisteTimestamp', (err) => {
            if (err) {
                return callback(err);
            }
            this.createDelta('mediathekIndexer:newFilmliste', 'mediathekIndexer:currentFilmliste', (err) => {
                if (err) {
                    return callback(err);
                }
                this.indexDelta((err) => {
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
            });
        });
    }

    createDelta(newSet, currentSet, callback) {
        this.stateEmitter.setState('step', 'createDelta');

        let added = 0;
        let removed = 0;
        this.redis.multi()
            .sdiffstore('mediathekIndexer:addedEntries', newSet, currentSet)
            .sdiffstore('mediathekIndexer:removedEntries', currentSet, newSet)
            .scard('mediathekIndexer:addedEntries', (err, reply) => {
                added = reply;
            })
            .scard('mediathekIndexer:removedEntries', (err, reply) => {
                removed = reply;
            })
            .exec((err, replies) => {
                if (err) {
                    return callback(err);
                }
                this.stateEmitter.updateState({
                    added: added,
                    removed: removed
                });
                callback(null);
            });
    }

    combineWorkerStates(workerStates) {
        let addedEntries = 0,
            removedEntries = 0;

        for (let i = 0; i < workerStates.length; i++) {
            if (workerStates[i] != undefined) {
                addedEntries += workerStates[i].addedEntries;
                removedEntries += workerStates[i].removedEntries;
            }
        }

        return {
            addedEntries: addedEntries,
            removedEntries: removedEntries
        };
    }

    indexDelta(callback) {
        this.stateEmitter.setState('step', 'indexDelta');

        let indexerWorkers = [config.workerCount];
        let indexerWorkersState = [config.workerCount];

        let workersDone = 0;
        let lastStatsUpdate = 0;

        for (let i = 0; i < config.workerCount; i++) {
            let indexerWorker = cp.fork('./MediathekIndexerWorker.js', {
                execArgv: config.workerArgs
            });

            indexerWorkers[i] = indexerWorker;

            let ipc = new IPC(indexerWorker);

            ipc.on('state', (state) => {
                indexerWorkersState[i] = state;

                if ((Date.now() - lastStatsUpdate) > 500) { //wait atleast 500ms
                    this.stateEmitter.updateState(this.combineWorkerStates(indexerWorkersState));
                    lastStatsUpdate = Date.now();
                }
            });
            ipc.on('done', () => {
                workersDone++;

                if (workersDone == config.workerCount) {
                    this.stateEmitter.updateState(this.combineWorkerStates(indexerWorkersState));
                    callback(null);
                }
            });
            ipc.on('error', (err) => {
                callback(new Error(err));
            });
        }
    }

    parseFilmliste(file, setKey, timestampKey, callback) {
        this.stateEmitter.setState('step', 'parseFilmliste');
        let filmlisteParser = cp.fork('./FilmlisteParser.js', {
            execArgv: config.workerArgs
        });

        let ipc = new IPC(filmlisteParser);

        ipc.on('error', (errMessage) => {
            callback(new Error(errMessage));
        });

        let lastState = null;
        let lastStatsUpdate = 0;


        ipc.on('state', (state) => {
            lastState = state;

            if ((Date.now() - lastStatsUpdate) > 500) { //wait atleast 500ms
                this.stateEmitter.updateState(lastState);
                lastStatsUpdate = Date.now();
            }
        });

        ipc.on('done', () => {
            this.stateEmitter.updateState(lastState);
            callback(null);
        });

        ipc.send('parseFilmliste', {
            file: file,
            setKey: setKey,
            timestampKey: timestampKey
        });
    }
}

module.exports = MediathekIndexer;