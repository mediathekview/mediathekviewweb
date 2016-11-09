const EventEmitter = require('events');
const cp = require('child_process');
const os = require('os');
const REDIS = require('redis');
const underscore = require('underscore');

const cpuCount = os.cpus().length;

class MediathekIndexer extends EventEmitter {
    constructor(host = '127.0.0.1', port = 6379, password = null, flush = true) {
        super();
        this.workers = [];
        this.workersState = [];
        this.options = {
            host: host,
            port: port,
            password: password,
            flush: flush
        };
    }

    indexFile(file) {
        if (this.options.flush) {
            let redis = REDIS.createClient({
                host: host,
                port: port,
                password: password
            });
            redis.on('ready', () => {
                redis.flushall((err, reply) => {
                    console.log('flushed: ' + reply);
                    redis.quit();
                    this.startWorkers(file);
                });
            });
        } else {
            this.startWorkers(file);
        }
    }

    startWorkers(file) {
        for (let i = 0; i < cpuCount; i++) {
            this.startWorker(file, i, i);
        }
    }

    startWorker(file, skip, offset) {
        let worker = cp.fork('./MediathekIndexerWorker.js');

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
                        skip: skip,
                        offset: offset
                    });
                } else if (message.body.notification == 'progress') {
                    workersState[workerIndex] = message.body;
                    emitWorkerState(workerIndex);
                }
            }
        });
    }

    emitWorkerState(index) {
        this.emit('workerProgress', index, workersState[workerIndex]);
    }

    sendMessage(worker, type, body) {
        worker.send({
            type: type,
            body: body
        });
    }
}

module.exports = MediathekIndexer;
