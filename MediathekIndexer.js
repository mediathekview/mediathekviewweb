const cp = require('child_process');
const os = require('os');
const REDIS = require('redis');

const cpuCount = os.cpus().length;

class MediathekIndexer {
    constructor(host = '127.0.0.1', port = 6379, password = null, flush = true) {
        this.workers = [];
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
            this.workers.push(this.startWorker(file, i, i));
        }
    }

    startWorker(file, skip, offset) {
        let worker = cp.fork('./MediathekIndexerWorker.js');

        worker.on('message', (message) => {
            if (message.type == 'notification') {
                if (message.body == 'ready') {
                    this.sendMessage(worker, 'command', {
                        command: 'init',
                        host: this.options.host,
                        port: this.options.port,
                        password: this.options.password
                    });
                } else if (message.body == 'initialized') {
                    this.sendMessage(worker, 'command', {
                        command: 'indexFile',
                        file: file,
                        skip: skip,
                        offset: offset
                    });
                }
            }
        });

        return worker;
    }

    sendMessage(worker, type, body) {
        worker.send({
            type: type,
            body: body
        });
    }
}
