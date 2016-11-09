const EventEmitter = require('events');
const cp = require('child_process');
const os = require('os');
const REDIS = require('redis');
const underscore = require('underscore');

const cpuCount = os.cpus().length;

const workerNum = 4;
const workerArgs = process.execArgv.concat(['--optimize_for_size', '--max_old_space_size=60', '--max_executable_size=100', '--memory-reducer']);

class MediathekIndexer extends EventEmitter {
    constructor(host = '127.0.0.1', port = 6379, password = '', db1, db2) {
        super();
        this.workers = [];
        this.workersState = [];
        this.options = {
            host: host,
            port: port,
            password: password,
            db1: db1,
            db2: db2
        };
    }

    indexFile(file, minWordSize) {
        let redis = REDIS.createClient({
            host: this.options.host,
            port: this.options.port,
            password: this.options.password
        });

        redis.on('ready', () => {
            redis.select(this.options.db1, (err, reply) => {
                if (err) throw err;
                console.log('flushing db ' + this.options.db1)
                redis.flushdb((reply) => {
                    console.log(reply);
                    console.log('flushing db ' + this.options.db2)
                    redis.select(this.options.db2, (err, reply) => {
                        if (err) {
                            console.error(err);
                            process.exit(1);
                        }
                        console.log(reply);
                        redis.flushdb((reply) => {
                            console.log(reply);
                            redis.quit();
                            this.startWorkers(file, minWordSize);
                        });
                    });
                });
            });
        });
    }

    startWorkers(file, minWordSize) {
        for (let i = 0; i < workerNum; i++) {
            this.startWorker(file, minWordSize, i, workerNum, i);
        }
    }

    startWorker(file, minWordSize, begin, skip, offset) {
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
                        password: this.options.password
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
                    this.emitWorkerState(workerIndex);
                }
            }
        });
    }

    emitWorkerState(index) {
        this.emit('workerState', index, this.workersState[index]);
    }

    sendMessage(worker, type, body) {
        worker.send({
            type: type,
            body: body
        });
    }
}

module.exports = MediathekIndexer;
