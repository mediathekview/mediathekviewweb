const REDIS = require('redis');
const fs = require('fs');
const lineReader = require('line-reader');
const moment = require('moment');

var indexBuffer = []; //for searchIndex
var entryBuffer = []; //for indexData
var entryCounter = 0;
var currentLine = 0;
var progress = 0;
var notifyInterval;
var indexBegin;

var getProgress;

process.on('message', (message) => {
    if (message.type == 'command') {
        if (message.body.command == 'init') {
            init(message.body.host, message.body.port, message.body.password);
        } else if (message.body.command == 'indexFile') {
            indexFile(message.body.file, message.body.skip, message.body.offset, message.body.minWordSize);
        } else {
            console.log('unrecognized command: ' + message.body.command);
        }
    } else {
        console.log('unrecognized message.type: ' + message.type);
    }
});

function init(host, port, password) {
    var searchIndex = REDIS.createClient({
        host: host,
        port: port,
        password: password,
        db: 0
    });

    var indexData = REDIS.createClient({
        host: host,
        port: port,
        password: password,
        db: 1
    });

    var searchIndex.on('error', (err) => {
        sendMessage('notification', {
            notification: 'error',
            error: err
        });
    });

    var indexData.on('error', (err) => {
        sendMessage('notification', {
            notification: 'error',
            error: err
        });
    });

    var searchIndex.on('ready', () => emitInitialized());
    var indexData.on('ready', () => emitInitialized());
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

function indexFile(file, skip, offset, minWordSize) {
    indexBegin = Date.now();
    notifyInterval = setInterval(() => notifyProgress(), 1000);

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

        if (currentLine < offset || currentLine % skip != 0) {
            getNext();
        }

        let match = indexRegex.exec(line);
        if (match != null) {
            var entry = {
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
        }

        processEntry(entry, minWordSize, last, getNext);
    }).then((err) => {
        finalize();
    });
}

function processEntry(entry, minWordSize, last, getNext) {
    entryCounter++;

    let splits = entry.title.trim().replace(':', '').toLowerCase().split(' ');

    for (let i in splits) {
        let split = splits[i];

        for (let begin = 0; begin <= split.length - MIN_WORD_SIZE; begin++) {
            for (let end = begin + MIN_WORD_SIZE; end <= split.length; end++) {
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
        getNext();
    }
}

function finalize() {
    flushIndexBuffer();
    flushEntryBuffer();
    clearInterval(notifyInterval);
    notifyProgress(true);
}

function flushIndexBuffer() {
    searchIndex.batch(indexBuffer).exec();
    indexBuffer = [];
}

function flushEntryBuffer() {
    indexData.batch(entryBuffer).exec();
    entryBuffer = [];
}

function notifyProgress(done = false) {
    searchIndex.dbsize((err, reply) => {
        sendMessage('notification', {
            notification: 'progress',
            entries: entryCounter,
            indices: reply,
            time: Date.now() - begin,
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
