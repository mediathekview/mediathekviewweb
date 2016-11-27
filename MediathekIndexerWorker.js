const REDIS = require('redis');
const fs = require('fs');
const lineReader = require('line-reader');
const moment = require('moment');
const exec = require('child_process').exec;

exec('renice 10 -p ' + process.pid);

var searchIndex, indexData;

var websitesSet = new Set();

var indexBuffer = []; //for searchIndex
var entryBuffer = []; //for indexData
var entryCounter = 0;
var currentLine = 0;
var notifyInterval;
var indexBegin;

var getProgress;

process.on('message', (message) => {
    if (message.type == 'command') {
        if (message.body.command == 'init') {
            init(message.body.host, message.body.port, message.body.password, message.body.db1, message.body.db2);
        } else if (message.body.command == 'indexFile') {
            indexFile(message.body.file, message.body.begin, message.body.skip, message.body.offset, message.body.substrSize);
        } else {
            console.log('unrecognized command: ' + message.body.command);
        }
    } else {
        console.log('unrecognized message.type: ' + message.type);
    }
});

function init(host, port, password, db1, db2) {
    searchIndex = REDIS.createClient({
        host: host,
        port: port,
        password: password,
        db: db1
    });

    indexData = REDIS.createClient({
        host: host,
        port: port,
        password: password,
        db: db2
    });

    searchIndex.on('error', (err) => {
        sendMessage('notification', {
            notification: 'error',
            error: err
        });
    });

    indexData.on('error', (err) => {
        sendMessage('notification', {
            notification: 'error',
            error: err
        });
    });

    searchIndex.on('ready', () => emitInitialized());
    indexData.on('ready', () => emitInitialized());
}

var initCounter = 0;

function emitInitialized() {
    if (++initCounter == 2) {
        sendMessage('notification', {
            notification: 'initialized'
        });
    }
}


/*"X" : [ "Sender", "Thema", "Titel", "Datum", "Zeit", "Dauer", "Größe [MB]", "Beschreibung", "Url", "Website", "Url Untertitel", "Url RTMP", "Url Klein", "Url RTMP Klein", "Url HD", "Url RTMP HD", "DatumL", "Url History", "Geo", "neu" ] */
const indexRegex = /"X" : \[ "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)" ]/;
const websiteRegex = /https?:\/\/([A-Za-z0-9-]+\.)*([A-Za-z0-9-]+\.[A-Za-z0-9-]+)/;

function indexFile(file, begin, skip, offset, substrSize) {
    indexBegin = Date.now();
    notifyInterval = setInterval(() => notifyState(), 500);

    let fileStream = fs.createReadStream(file);

    let fileSize = 0;
    fs.stat(file, (err, stats) => {
        fileSize = stats.size;
    });

    getProgress = () => {
        return fileStream.bytesRead / fileSize;
    };

    lineReader.eachLine(fileStream, (line, last, getNext) => {
        currentLine++;

        if (last) {
            setImmediate(() => finalize());
            return;
        } else if (currentLine <= 3 || currentLine <= begin || (currentLine - offset) % skip != 0) {
            setImmediate(() => getNext());
            return;
        }

        if (line[line.length - 1] == ',')
            line = line.slice(0, -1);

        let parsed = JSON.parse('{' + line + '}').X;

        let websiteNameMatch = websiteRegex.exec(parsed[9]);

        let websiteName;
        if (websiteNameMatch != null) {
            websiteName = websiteNameMatch[2];
        } else {
            websiteName = 'unknown';
        }

        durationSplit = parsed[5].split(':');

        let entry = {
            topic: parsed[1],
            title: parsed[2],
            //timestamp: moment(parsed[3] + parsed[4], 'DD.MM.YYYYHHmm').unix(),
            timestamp: parseInt(parsed[16]),
            duration: (parseInt(durationSplit[0]) * 60 * 60) + (parseInt(durationSplit[1]) * 60) + parseInt(durationSplit[2]),
            size: parseInt(parsed[6]) * 1000000, //MB to bytes
            websiteName: websiteName,
            url_video: parsed[8],
            url_website: parsed[9],
            url_video_low: createUrlFromBase(parsed[8], parsed[12]),
            url_video_hd: createUrlFromBase(parsed[8], parsed[14])
        };

        processEntry(entry, substrSize, last, getNext);
    });
}

function createUrlFromBase(baseUrl, newUrl) {
    let newSplit = newUrl.split('|');
    if (newSplit.length == 2) {
        return baseUrl.substr(0, newSplit[0]) + newSplit[1];
    } else {
        return '';
    }
}

function processEntry(entry, substrSize, last, getNext) {
    entryCounter++;

    let splits = (entry.title + ' ' + entry.topic).trim().toLowerCase().split(/\s|:/).filter((split) => {
        return !!split;
    });

    for (let i in splits) {
        let split = splits[i];

        if (split.length < substrSize) {
            indexBuffer.push(['sadd', split, currentLine]);
        } else {
            for (let begin = 0; begin <= split.length - substrSize; begin++) {
                for (let end = begin + substrSize; end <= split.length; end++) {
                    let key = split.slice(begin, end);

                    indexBuffer.push(['sadd', key, currentLine]);
                }
            }
        }
    }

    websitesSet.add(entry.websiteName);
    entryBuffer.push(['hmset', currentLine, 'title', entry.title, 'timestamp', entry.timestamp, 'duration', entry.duration, 'size', entry.size,
        'url_video', entry.url_video, 'url_video_low', entry.url_video_low, 'url_video_hd', entry.url_video_hd, 'url_website', entry.url_website, 'websiteName', entry.websiteName
    ]);

    if (indexBuffer.length >= 300) {
        flushIndexBuffer();
    }
    if (entryBuffer.length >= 100) {
        flushEntryBuffer();
    }

    if (!last) {
        setImmediate(() => getNext());
    }
}

function finalize() {
    clearInterval(notifyInterval);
    flushIndexBuffer();
    flushEntryBuffer();

    indexData.sadd('websitenames', Array.from(websitesSet), (err, reply) => {
        notifyState(true);

        searchIndex.quit(() => exitProcess());
        indexData.quit(() => exitProcess());
    });
}

var exitCounter = 0;

function exitProcess() {
    if (++exitCounter == 2) {
        setTimeout(() => process.exit(0), 500);
    }
}

function flushIndexBuffer() {
    searchIndex.batch(indexBuffer).exec();
    indexBuffer = [];
}

function flushEntryBuffer() {
    indexData.batch(entryBuffer).exec();
    entryBuffer = [];
}

function notifyState(done = false) {
    searchIndex.dbsize((err, reply) => {
        sendMessage('notification', {
            notification: 'state',
            entries: entryCounter,
            indices: reply,
            time: Date.now() - indexBegin,
            progress: getProgress(),
            done: done
        });
    });
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
