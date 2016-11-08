var REDIS = require('redis');
var underscore = require('underscore');

process.on('message', (message) => {
    if (message.type == 'command') {
        if (message.body.command == 'init') {
            init(message.body.options);
        }
    }
});

function init(options) {
    var searchIndex = REDIS.createClient({
        host: options.host,
        port: options.port,
        password: options.password,
        db: 0
    });

    var indexData = REDIS.createClient({
        host: options.host,
        port: options.port,
        password: options.password,
        db: 1
    });

    searchIndex.on("error", (err) => {
        sendMessage('notification', {
            notification: 'error',
            error: err
        });
    });

    indexData.on("error", (err) => {
        sendMessage('notification', {
            notification: 'error',
            error: err
        });
    });

    if (options.flush) {
        this.searchIndex.flushdb();
        this.indexData.flushdb();
        sendMessage
    }
}

function sendMessage(type, body) {
    process.send({
        type: type,
        body: body
    });
}

sendMessage('notification', {
    notification: 'ready'
});
