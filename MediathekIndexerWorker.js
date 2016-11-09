const REDIS = require('redis');
const fs = require('fs');
const lineReader = require('line-reader');
const moment = require('moment');

var searchIndex, indexData;

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
            indexFile(message.body.file, message.body.begin, message.body.skip, message.body.offset, message.body.minWordSize);
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

function indexFile(file,begin, skip, offset, minWordSize) {
    indexBegin = Date.now();
    notifyInterval = setInterval(() => notifyState(), 1000);

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
        }
        else if (currentLine <= begin || (currentLine-offset) % skip != 0) {
            setImmediate(() => getNext());
            return;
        }

        let match = indexRegex.exec(line);
        if (match != null) {
            let entry = {
                //channel: match[1],
                //topic: match[2],
                title: match[3],
                //date: match[4],
                //time: match[5],
                timestamp: moment(match[4] + match[5], 'DD.MM.YYYYHHmm').unix(),
                duration: match[6],
                size: match[7] * 1000000, //MB to bytes
                //description: match[8],
                url_video: match[9],
                url_website: match[10]
                    /*urls: {
                        video: match[9],
                        website: match[10],
                        //subtitle: match[11],
                        //rtmp: match[12],
                        //video_short: match[13],
                        //rtmp_short: match[14],
                        //hd: match[15],
                        //rtmp_hd: match[16],
                        //history: match[18],
                    },*/
                    //dateL: match[17],
                    //geo: match[19],
                    //new: match[20]
            };

            processEntry(entry, minWordSize, last, getNext);
        }
        else {
            setImmediate(() => getNext());
        }
    });
}

function processEntry(entry, minWordSize, last, getNext) {
    entryCounter++;

    let splits = entry.title.trim().replace(':', '').toLowerCase().split(' ');

    for (let i in splits) {
        let split = splits[i];

        for (let begin = 0; begin <= split.length - minWordSize; begin++) {
            for (let end = begin + minWordSize; end <= split.length; end++) {
                let key = split.slice(begin, end);

                indexBuffer.push(['sadd', key, currentLine]);
            }
        }
    }

    entryBuffer.push(['hmset', currentLine, 'title', entry.title, 'timestamp', entry.timestamp, 'duration', entry.duration, 'size', entry.size, 'url_video', entry.url_video, 'url_website', entry.url_website]);

    if (indexBuffer.length >= 500) {
        flushIndexBuffer();
    }
    if (entryBuffer.length >= 200) {
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
    notifyState(true);

    setTimeout(() => process.exit(0), 500);
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
