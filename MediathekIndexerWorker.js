const REDIS = require('redis');
const fs = require('fs');
const lineReader = require('line-reader');
const moment = require('moment');
const IPC = require('./IPC.js');
const utils = require('./utils.js');

var ipc = new IPC(process);

var indicesRedis, entriesRedis, filmlisteRedis;
var error = false;
var noNewFilme = false;
var filmlisteBuffer = [];
var channelSet = new Set();
var topicSet = new Set();
var indexBuffer = []; //for indicesRedis
var entryBuffer = []; //for indexData
var entryCounter = 0;
var notifyInterval;
var indexBegin;
var substringSize;

ipc.on('init', (data) => {
    console.log(data);
    init(data.indicesRedisSettings, data.entriesRedisSettings, data.filmlisteRedisSettings);
});

ipc.on('index', (data) => {
    index(data.substringSize);
});

function init(indicesRedisSettings, entriesRedisSettings, filmlisteRedisSettings) {
    indicesRedis = REDIS.createClient(indicesRedisSettings);
    entriesRedis = REDIS.createClient(entriesRedisSettings);
    filmlisteRedis = REDIS.createClient(filmlisteRedisSettings);

    indicesRedis.on('error', (err) => handleError(err));
    entriesRedis.on('error', (err) => handleError(err));
    filmlisteRedis.on('error', (err) => handleError(err));

    indicesRedis.on('ready', () => emitInitialized());
    entriesRedis.on('ready', () => emitInitialized());
    filmlisteRedis.on('ready', () => emitInitialized());
}

function handleError(err) {
    error = true;
    ipc.send('error', err);
    indicesRedis.quit();
    entriesRedis.quit();
    filmlisteRedis.quit();
}

var initCounter = 0;

function emitInitialized() {
    if (++initCounter == 3) {
        ipc.send('initialized');
    }
}

function createUrlFromBase(baseUrl, newUrl) {
    let newSplit = newUrl.split('|');
    if (newSplit.length == 2) {
        return baseUrl.substr(0, newSplit[0]) + newSplit[1];
    } else {
        return '';
    }
}

function index(substrSize) {
    indexBegin = Date.now();
    notifyInterval = setInterval(() => notifyState(), 500);
    substringSize = substrSize;

    fillBuffer();
    processEntry();
}

function fillBuffer() {
    let parsingDone = false;
    let llen = 0;
    filmlisteRedis.multi()
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

    entryBuffer.push(['hmset', index, 'channel', entry.channel, 'topic', entry.topic, 'title', entry.title, 'timestamp', entry.timestamp, 'duration', entry.duration, 'size', entry.size,
        'url_video', entry.url_video, 'url_video_low', entry.url_video_low, 'url_video_hd', entry.url_video_hd, 'url_website', entry.url_website
    ]);

    if (!channelSet.has(entry.channel)) {
        channelSet.add(entry.channel);
        indexBuffer.push(['sadd', 'channels', entry.channel]);
    }
    if (!topicSet.has(entry.topic)) {
        topicSet.add(entry.topic);
        indexBuffer.push(['sadd', 'topics', entry.topic]);
    }

    indexBuffer.push(['sadd', 'channel:' + entry.channel, index]);
    indexBuffer.push(['sadd', 'topic:' + entry.topic, index]);
    indexBuffer.push(['zadd', 'times', !!entry.timestamp ? entry.timestamp : -1, index]);
    indexBuffer.push(['zadd', 'durations', !!entry.duration ? entry.duration : -1, index]);

    let titleSplits = utils.createGoodSplits(entry.title);
    let topicSplits = utils.createGoodSplits(entry.topic);
    let channelSplits = utils.createGoodSplits(entry.channel);

    for (let i = 0; i < titleSplits.length; i++) {
        let subs = createSubStrings(titleSplits[i], substringSize);

        for (let j = 0; j < subs.length; j++) {
            indexBuffer.push(['sadd', 'i:' + subs[j], index]);
        }
    }

    for (let i = 0; i < topicSplits.length; i++) {
        let subs = createSubStrings(topicSplits[i], substringSize);

        for (let j = 0; j < subs.length; j++) {
            indexBuffer.push(['sadd', 't:' + subs[j], 'topic:' + entry.topic]);
        }
    }

    for (let i = 0; i < channelSplits.length; i++) {
        let subs = createSubStrings(channelSplits[i], 2);

        for (let j = 0; j < subs.length; j++) {
            indexBuffer.push(['sadd', 'c:' + subs[j], 'channel:' + entry.channel]);
        }
    }

    if (indexBuffer.length >= 500) {
        flushIndexBuffer();
    }
    if (entryBuffer.length >= 150) {
        flushEntryBuffer();
    }

    setImmediate(() => processEntry());
}

function createSubStrings(str, minLength) {
    let subs = [];

    if (str.length < minLength) {
        subs.push(str);
    } else {
        for (let begin = 0; begin <= str.length - minLength; begin++) {
            for (let end = begin + minLength; end <= str.length; end++) {
                let sub = str.slice(begin, end);
                subs.push(sub);
            }
        }
    }

    return subs;
}

function finalize() {
    clearInterval(notifyInterval);
    flushIndexBuffer();
    flushEntryBuffer();

    notifyState(true);

    indicesRedis.quit(() => exitProcess());
    entriesRedis.quit(() => exitProcess());
    filmlisteRedis.quit(() => exitProcess());
}

var exitCounter = 0;

function exitProcess() {
    if (++exitCounter == 3) {
        setTimeout(() => process.exit(0), 500);
    }
}

function flushIndexBuffer() {
    indicesRedis.batch(indexBuffer).exec();
    indexBuffer = [];
}

function flushEntryBuffer() {
    entriesRedis.batch(entryBuffer).exec();
    entryBuffer = [];
}

function notifyState(done = false) {
    indicesRedis.dbsize((err, reply) => {
        ipc.send('state', {
            entries: entryCounter,
            indices: reply,
            time: Date.now() - indexBegin,
            done: done
        });
    });
}

ipc.send('ready');
