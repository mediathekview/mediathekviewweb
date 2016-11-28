const REDIS = require('redis');
const lineReader = require('line-reader');
const fs = require('fs');
const IPC = require('./IPC.js');

var ipc = new IPC(process);

var redis;
var buffer = [];
var entries = 0;
var getProgress;

function parseFilmliste(file, redisSettings, listKey) {
    begin = Date.now();
    redis = REDIS.createClient(redisSettings);


    let currentChannel;
    let currentTopic;

    let fileSize = 0;
    fs.stat(file, (err, stats) => {
        fileSize = stats.size;
    });

    let fileStream = fs.createReadStream(file);
    getProgress = () => {
        return fileStream.bytesRead / fileSize;
    };

    let currentLine = 0;
    lineReader.eachLine(fileStream, (line, last, getNext) => {
        currentLine++;

        if (currentLine >= 4 && !last) {
            if (line[line.length - 1] == ',') {
                line = line.slice(8, -1);
            } else {
                line = line.slice(8);
            }

            let parsed = JSON.parse(line);

            if (parsed[0].length == 0) {
                parsed[0] = currentChannel;
            } else {
                currentChannel = parsed[0];
            }
            if (parsed[1].length == 0) {
                parsed[1] = currentTopic;
            } else {
                currentTopic = parsed[1];
            }

            buffer.push(['lpush', listKey, JSON.stringify(parsed)]);

            if (currentLine % 500 == 0) {
                flushBuffer(false);
            }
        } else if (last) {
            flushBuffer(true);
        }

        getNext();
    });
}

function finalize() {
    ipc.send('done', {
        entries: entries
    });

    redis.quit(() => process.exit(0));
}

function flushBuffer(last) {
    if (last) {
        redis.batch(buffer).exec(finalize);
    } else {
        redis.batch(buffer).exec();
    }

    entries += buffer.length;
    buffer = [];

    ipc.send('state', {
        entries: entries,
        progress: getProgress()
    });
}

ipc.send('ready');

ipc.on('parseFilmliste', (data) => {
    parseFilmliste(data.file, data.redisSettings, data.listKey);
});
