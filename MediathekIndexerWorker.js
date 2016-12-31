const REDIS = require('redis');
const fs = require('fs');
const lineReader = require('line-reader');
const moment = require('moment');
const IPC = require('./IPC.js');
const utils = require('./utils.js');
const elasticsearch = require('elasticsearch');

var ipc = new IPC(process);

var redis;
var searchClient;
var searchIndex;
var error = false;
var noNewFilme = false;
var buffer = [];
var bufferFlushPending = false;
var isFlushing = false;
var filmlisteBuffer = [];
var entryCounter = 0;
var notifyInterval;
var indexBegin;

ipc.on('init', (data) => {
    init(data.redisSettings, data.elasticsearchSettings, data.index);
});

ipc.on('index', () => {
    index();
});

function init(redisSettings, elasticsearchSettings, index) {
    redis = REDIS.createClient(redisSettings);
    searchIndex = index;

    redis.on('error', (err) => handleError(err));
    redis.on('ready', () => emitInitialized());

    searchClient = new elasticsearch.Client(elasticsearchSettings);
}

function handleError(err) {
    error = true;
    ipc.send('error', err);
    redis.quit();
}

var initCounter = 0;

function emitInitialized() {
    ipc.send('initialized');
}

function createUrlFromBase(baseUrl, newUrl) {
    let newSplit = newUrl.split('|');
    if (newSplit.length == 2) {
        return baseUrl.substr(0, newSplit[0]) + newSplit[1];
    } else {
        return '';
    }
}

function index() {
    indexBegin = Date.now();
    notifyInterval = setInterval(() => notifyState(), 500);

    fillBuffer();
    processEntry();
}

function fillBuffer() {
    let parsingDone = false;
    let llen = 0;
    redis.multi()
        .lrange('entries', -250, -1, (err, result) => {
            filmlisteBuffer = filmlisteBuffer.concat(result);
        }).ltrim('entries', 0, -251)
        .get('parsingDone', (err, result) => {
            parsingDone = result;
        }).llen('entries', (err, result) => {
            llen = result;
        }).exec((err, result) => {
            if (parsingDone && llen == 0) {
                noNewFilme = true;
            }
        });
}

function processEntry() {
    if (error) {
        return;
    }

    if (filmlisteBuffer.length < 50 && !noNewFilme) {
        fillBuffer();
    }

    if (filmlisteBuffer.length == 0) {
        if (!noNewFilme) {
            setTimeout(() => processEntry(), 10);
            return;
        } else {
            finalize();
            return;
        }
    }

    if (buffer.length > 500) {
        setTimeout(() => processEntry(), 10);
        return;
    }

    entryCounter++;

    let parsed = JSON.parse(filmlisteBuffer.pop());
    let index = parsed[20];

    durationSplit = parsed[5].split(':');

    let entry = {
        channel: parsed[0],
        topic: parsed[1],
        title: parsed[2],
        timestamp: parseInt(parsed[16]),
        duration: (parseInt(durationSplit[0]) * 60 * 60) + (parseInt(durationSplit[1]) * 60) + parseInt(durationSplit[2]),
        size: parseInt(parsed[6]) * 1000000, //MB to bytes
        url_video: parsed[8],
        url_website: parsed[9],
        url_video_low: createUrlFromBase(parsed[8], parsed[12]),
        url_video_hd: createUrlFromBase(parsed[8], parsed[14])
    };

    buffer.push({
        index: {
            _index: searchIndex,
            _type: 'entries',
            _id: index
        }
    });
    buffer.push(entry);

    if (buffer.length >= 350) {
        flushBuffer();
    }

    setImmediate(() => processEntry());
}

function finalize() {
    clearInterval(notifyInterval);
    flushBuffer();

    notifyState(true);
    redis.quit(() => exitProcess());
}

var exitCounter = 0;

function exitProcess() {
    setTimeout(() => process.exit(0), 500);
}

function flushBuffer() {
    if (!isFlushing) {
        bufferFlushPending = false;
        isFlushing = true;

        searchClient.bulk({
            body: buffer
        }, (err, resp) => {
            if (err) {
                handleError(err);
            }

            isFlushing = false;

            if (bufferFlushPending) {
                setImmediate(() => flushBuffer(), 10);
            }
        });

        buffer = [];
    } else if (!bufferFlushPending) {
        bufferFlushPending = true;
    }
}

function notifyState(done = false) {
    ipc.send('state', {
        entries: entryCounter,
        time: Date.now() - indexBegin,
        done: done
    });
}

ipc.send('ready');
