const EventEmitter = require('events');
const cp = require('child_process');
const os = require('os');
const IPC = require('./IPC.js');
const REDIS = require('redis');
const moment = require('moment');
const underscore = require('underscore');
const lineReader = require('line-reader');

const cpuCount = os.cpus().length;
const workerArgs = process.execArgv.concat(['--optimize_for_size', '--memory-reducer']);

class MediathekIndexer extends EventEmitter {
    constructor(workerCount, indicesRedisSettings, entriesRedisSettings, filmlisteRedisSettings) {
        super();

        this.options = {};
        this.options.workerCount = workerCount == 'auto' ? cpuCount : workerCount;
        this.options.indicesRedisSettings = indicesRedisSettings;
        this.options.entriesRedisSettings = entriesRedisSettings;
        this.options.filmlisteRedisSettings = filmlisteRedisSettings;

        this.indicesRedis = REDIS.createClient(this.options.indicesRedisSettings);
        this.entriesRedis = REDIS.createClient(this.options.entriesRedisSettings);
        this.filmlisteRedis = REDIS.createClient(this.options.filmlisteRedisSettings);

        this.indexers = [];
        this.indexersState = new Array(this.options.workerCount);
        this.totalEntries = 0;
        this.parserProgress = 0;
        this.indexBegin = 0;

        this.indexingCompleteCallback = null;
    }

    getLastIndexTimestamp(callback) {
        this.indicesRedis.get('indexTimestamp', (err, reply) => {
            if (!err) {
                callback(reply);
            } else {
                callback(0);
            }
        });
    }

    getLastIndexHasCompleted(callback) {
        this.indicesRedis.get('indexCompleted', (err, reply) => {
            if (!err) {
                callback(reply === 'true');
            } else {
                callback(false);
            }
        });
    }

    indexFile(file, substrSize, indexingCompleteCallback) {
        if (this.indexing) {
            throw new Error('already indexing');
        }

        this.file = file;
        this.substringSize = substrSize;
        this.indexingCompleteCallback = indexingCompleteCallback;
        this.indexBegin = Date.now();


        this.flushedDatabasesCounter = 0;
        this.indicesRedis.flushdb(() => this.flushedDatabase());
        this.entriesRedis.flushdb(() => this.flushedDatabase());
        this.filmlisteRedis.flushdb(() => this.flushedDatabase());

        this.emitState();
    }

    flushedDatabase() {
        if (++this.flushedDatabasesCounter == 3) {
            this.indices = 0;
            this.startWorkers();
        }
    }

    startWorkers() {
        let filmlisteParser = cp.fork('./FilmlisteParser.js', {
            execArgv: workerArgs
        });

        let parserIpc = new IPC(filmlisteParser);

        parserIpc.on('ready', () => {
            parserIpc.send('parseFilmliste', {
                file: this.file,
                redisSettings: this.options.filmlisteRedisSettings
            });
            parserIpc.on('state', (state) => {
                this.totalEntries = state.entries;
                this.parserProgress = state.progress;
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
                indicesRedisSettings: this.options.indicesRedisSettings,
                entriesRedisSettings: this.options.entriesRedisSettings,
                filmlisteRedisSettings: this.options.filmlisteRedisSettings
            });
        });

        ipcIndexer.on('initialized', () => {
            ipcIndexer.send('index', {
                substringSize: this.substringSize
            });
        });

        ipcIndexer.on('error', (err) => {
            this.emit('error', err);
        });

        let indexerIndex = this.indexers.length;

        ipcIndexer.on('state', (state) => {
            this.indexersState[indexerIndex] = state;
            if (state.indices > this.indices) {
                this.indices = state.indices;
            }
            this.emitState();
        });

        this.indexers.push({
            indexer: indexer,
            progress: 0,
            entries: 0,
            indices: 0,
            time: 0,
            done: false
        });
    }

    emitState() {
        this.emitState = underscore.throttle(() => {
            var progress = 0;
            var entries = 0;
            var done = true;
            var indices = 0;

            for (var i = 0; i < this.indexersState.length; i++) {
                if (this.indexersState[i] != undefined) {
                    progress += this.indexersState[i].progress;
                    entries += this.indexersState[i].entries;

                    if (this.indexersState[i].done == false) {
                        done = false;
                    }
                } else {
                    done = false;
                }
            }

            if (done) {
                this.indexers = [];
                this.indexersState = new Array(this.options.workerCount);

                this.indicesRedis.smembers('channels', (err, result) => {

                    let batch1 = this.indicesRedis.batch();
                    let batch2 = this.indicesRedis.batch();
                    let batch3 = this.indicesRedis.batch();

                    for (let i = 0; i < result.length; i++) {
                        let channel = 'channel:' + result[i];

                        batch1.zinterstore(channel + 'newesttemp', 2, 'times', channel)
                            .zrevrange(channel + 'newesttemp', 0, 49, 'withscores', (err, result) => {
                                let commands = [];
                                for (let i = 0; i < result.length; i += 2) {
                                    batch2.zadd(channel + 'newest', result[i + 1], result[i]);
                                }
                            })
                            .del(channel + 'newesttemp');
                    }

                    batch1.exec(() => {
                        batch2.exec(() => {
                            batch3.set('indexTimestamp', Date.now())
                                .set('indexCompleted', true)
                                .exec((err, replies) => {
                                    this._emitState(entries, done);
                                    if (typeof(this.indexingCompleteCallback) == 'function') {
                                        this.indexingCompleteCallback();
                                    }
                                });
                        });
                    });
                });
            } else {
                this._emitState(entries, done);
            }

        }, 500);
        this.emitState();
    }

    _emitState(entries, done) {
        this.emit('state', {
            parserProgress: this.parserProgress,
            indexingProgress: entries / (this.totalEntries / this.parserProgress),
            totalEntries: this.totalEntries,
            entries: entries,
            indices: this.indices,
            time: Date.now() - this.indexBegin,
            done: done
        });
    }
}

module.exports = MediathekIndexer;
