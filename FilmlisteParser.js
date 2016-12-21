const REDIS = require('redis');
const lineReader = require('line-reader');
const fs = require('fs');
const IPC = require('./IPC.js');

var ipc = new IPC(process);

var redis;
var buffer = [];
var entries = 0;
var getProgress;

ipc.on('parseFilmliste', (data) => {
    parseFilmliste(data.file, data.redisSettings);
});

function parseFilmliste(file, redisSettings) {
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

        //if (currentLine == 20000)
        //    last = true;

        if (currentLine >= 4 && !last) {
            if (line[line.length - 1] == ',') {
                line = line.slice(8, -1);
            } else {
                line = line.slice(8);
            }

            let parsed = JSON.parse(line);
            entries++;

            parsed[20] = entries;

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

            buffer.push(['lpush', 'entries', JSON.stringify(parsed)]);

            if (currentLine % 500 == 0) {
                flushBuffer(false);
            }
        } else if (last) {
            flushBuffer(true);
        }

        if (!last) {
            getNext();
        }
    });
}

function finalize() {
    ipc.send('done', {
        entries: entries
    });

    redis.batch().set('parsingDone', true).quit(() => setTimeout(() => process.exit(0), 500)).exec();
}

function flushBuffer(last) {
    if (last) {
        redis.batch(buffer).exec(finalize);
    } else {
        redis.batch(buffer).exec();
    }

    buffer = [];

    ipc.send('state', {
        entries: entries,
        progress: getProgress()
    });
}

ipc.send('ready');
