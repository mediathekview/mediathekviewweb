const EventEmitter = require('events');
const cp = require('child_process');
const os = require('os');
const REDIS = require('redis');
const moment = require('moment');
const underscore = require('underscore');
const lineReader = require('line-reader');

const cpuCount = os.cpus().length;
const workerArgs = process.execArgv.concat(['--optimize_for_size', '--memory-reducer']);

class MediathekIndexer extends EventEmitter {
    constructor(workerCount, host = '127.0.0.1', port = 6379, password = '', db1, db2) {
        super();

        this.workerCount = workerCount == 'auto' ? Math.ceil(cpuCount * 1.5) : workerCount;

        this.workers = [];
        this.workersState = new Array(this.workerCount);
        this.options = {
            host: host,
            port: port,
            password: password,
            db1: db1,
            db2: db2
        };
        this.indices = 0;
        this.indexBegin = 0;

        this.redis = REDIS.createClient({
            host: this.options.host,
            port: this.options.port,
            password: this.options.password
        });

        this.callback = null;
    }

    indexFile(file, minWordSize, callback) {
        if (this.indexing) {
            throw new Error('already indexing');
        }

        this.callback = callback;

        this.indexBegin = Date.now();

        this.emitState();

        let currentLine = 0;
        lineReader.eachLine(file, (line, last, getNext) => {
            currentLine++;
            if (currentLine == 2) {
                var filmliste = JSON.parse('{' + line.slice(0, -1) + '}').Filmliste;

                this.redis.batch()
                    .select(this.options.db1)
                    .flushdb()
                    .select(this.options.db2)
                    .flushdb()
                    .set('dataTimestamp', moment(filmliste[0], 'DD.MM.YYYY, HH:mm').unix())
                    .exec((err, replies) => {
                        if (err) throw err;
                        this.indices = 0;
                        this.startWorkers(file, minWordSize, this.options.db1, this.options.db2);
                    });

                getNext(false);
            } else {
                getNext();
            }
        });
    }

    startWorkers(file, minWordSize, db1, db2) {
        for (let i = 0; i < this.workerCount; i++) {
            this.startWorker(file, minWordSize, i, this.workerCount, i, db1, db2);
        }
    }

    startWorker(file, minWordSize, begin, skip, offset, db1, db2) {
        console.log('worker started: ' + skip + ' ' + offset);

        let worker = cp.fork('./MediathekIndexerWorker.js', {
            execArgv: workerArgs
        });

        this.workers.push({
            worker: worker,
            progress: 0,
            entries: 0,
            indices: 0,
            time: 0,
            done: false
        });

        let workerIndex = this.workers.length - 1;

        worker.on('message', (message) => {
            if (message.type == 'notification') {
                if (message.body.notification == 'ready') {
                    this.sendMessage(worker, 'command', {
                        command: 'init',
                        host: this.options.host,
                        port: this.options.port,
                        password: this.options.password,
                        db1: db1,
                        db2: db2
                    });
                } else if (message.body.notification == 'initialized') {
                    this.sendMessage(worker, 'command', {
                        command: 'indexFile',
                        file: file,
                        begin: begin,
                        skip: skip,
                        offset: offset,
                        minWordSize: minWordSize
                    });
                } else if (message.body.notification == 'state') {
                    this.workersState[workerIndex] = message.body;
                    this.indices = message.body.indices;
                    this.emitState();
                }
            }
        });
    }

    emitState() {
        this.emitState = underscore.throttle(() => {
            var progress = 0;
            var entries = 0;
            var done = true;

            for (var i = 0; i < this.workersState.length; i++) {
                if (this.workersState[i] != undefined) {
                    progress += this.workersState[i].progress;
                    entries += this.workersState[i].entries;
                    if (this.workersState[i].done == false) {
                        done = false;
                    }
                } else {
                    done = false;
                }
            }

            this.emit('state', {
                progress: progress / this.workerCount,
                entries: entries,
                indices: this.indices,
                time: Date.now() - this.indexBegin,
                done: done
            });

            if (done) {
                this.workers = [];
                this.workersState = new Array(this.workerCount);
                if (typeof(this.callback) == 'function') {
                    this.callback();
                }
            }
        }, 500);
        this.emitState();
    }

    sendMessage(worker, type, body) {
        worker.send({
            type: type,
            body: body
        });
    }
}

module.exports = MediathekIndexer;
