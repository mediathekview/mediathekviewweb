const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const URL = require('url');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const SearchEngine = require('./SearchEngine.js');
const REDIS = require('redis');
const MediathekManager = require('./MediathekManager.js');
const Hjson = require('hjson');
const exec = require('child_process').exec;
const PiwikTracker = require('piwik-tracker');
const utils = require('./utils.js');
const request = require('request');
const compression = require('compression');
const config = require('./config.js');

var redis = REDIS.createClient(config.redis);
redis.on('error', (err) => {
    console.error(err);
});

if (config.piwik.enabled) {
    var piwik = new PiwikTracker(config.piwik.siteId, config.piwik.piwikUrl);
}

var app = express();
var httpServer = http.Server(app);
var io = require('socket.io')(httpServer);

var elasticsearchSettings = JSON.stringify(config.elasticsearch);

var searchEngine = new SearchEngine();
var mediathekManager = new MediathekManager();
var websiteNames = [];

var indexing = false;
var lastIndexingState;
var filmlisteTimestamp = 0;

mediathekManager.on('state', (state) => {
    console.log();
    console.log(state);
    console.log();
});

mediathekManager.getCurrentFilmlisteTimestamp((timestamp) => {
    filmlisteTimestamp = timestamp;
});

if (!!piwik) {
    piwik.on('error', function(err) {
        console.error('piwik: error tracking request: ', err)
    });
}

app.use(compression());
app.use('/static', express.static(__dirname + '/static'));
app.use('/api', bodyParser.text());

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/donate', function(req, res) {
    res.sendFile(path.join(__dirname + '/donate.html'));
});
app.get('/impressum', function(req, res) {
    res.sendFile(path.join(__dirname + '/impressum.html'));
});
app.get('/datenschutz', function(req, res) {
    res.sendFile(path.join(__dirname + '/datenschutz.html'));
});

app.post('/api/query', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');

    let query;
    try {
        query = JSON.parse(req.body);
    } catch (e) {
        res.status(400).json({
            result: null,
            err: [e.message]
        });
        return;
    }

    let begin = process.hrtime();
    searchEngine.search(query, (result, err) => {
        let end = process.hrtime(begin);

        if (err) {
            if (err[0] == 'cannot query while indexing') {
                res.status(503);
            } else {
                res.status(500);
            }

            res.json({
                result: result,
                err: err
            });
            return;
        }

        let searchEngineTime = (end[0] * 1e3 + end[1] / 1e6).toFixed(2);

        let queryInfo = {
            filmlisteTimestamp: filmlisteTimestamp,
            searchEngineTime: searchEngineTime,
            resultCount: result.result.length,
            totalResults: result.totalResults
        };

        res.status(200).json({
            result: {
                results: result.result,
                queryInfo: queryInfo
            },
            err: null
        });

        console.log(moment().format('HH:mm') + ' - api used');
    });
});

io.on('connection', (socket) => {
    var clientIp = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress.match(/(\d+\.?)+/g)[0];
    var socketUid = null;

    console.log('client connected, ip: ' + clientIp);

    if (indexing && lastIndexingState != null) {
        socket.emit('indexState', lastIndexingState);
    }

    socket.on('getContentLength', (url, callback) => {
        redis.hget('mvw:contentLengthCache', url, (err, result) => {
            if (result) {
                callback(result);
            } else {
                request.head(url, (error, response, body) => {
                    let contentLength = response.headers['content-length'];
                    if (!contentLength) {
                        contentLength = -1;
                    }

                    callback(contentLength);
                    redis.hset('mvw:contentLengthCache', url, contentLength);
                });
            }
        });
    });

    socket.on('getDescription', (id, callback) => {
        if (indexing) {
            callback('cannot get description while indexing');
            return;
        }

        searchEngine.getDescription(id, callback);
    });

    socket.on('queryEntries', (query, callback) => {
        if (indexing) {
            callback({
                result: null,
                err: ['cannot query while indexing']
            });
            return;
        }

        queryEntries(query, (result, err) => {
            callback({
                result: result,
                err: err
            });
        });
    });

    function emitNewUid() {
        socket.emit('uid', utils.randomValueBase64(32));
    }

    socket.on('requestUid', () => {
        emitNewUid();
    });

    socket.on('track', (data) => {
        if (!data.uid || data.uid.length != 32) {
            emitNewUid();
            return;
        }

        if (!socketUid) {
            socketUid = data.uid;
        } else if (data.uid != socketUid) {
            socket.emit('uid', socketUid);
            return;
        }

        if (!!piwik) {
            if (!(typeof data.href === 'string' || data.href instanceof String)) {
                return;
            }

            let host = URL.parse(data.href).hostname;
            if (!config.piwik.allowedHosts.includes(host)) {
                return;
            }

            piwik.track({
                token_auth: config.piwik.token_auth,
                url: data.href,
                uid: socketUid,
                cip: clientIp,

                pv_id: data.pv_id,
                ua: data.ua,
                lang: data.lang,
                res: data.res,
                urlref: data.urlref,
                action_name: data.action_name,
                h: data.h,
                m: data.m,
                s: data.s,
                rand: data.rand
            });
        }
    });

    socket.on('getDonate', (callback) => {
        fs.readFile('donate.html', 'utf-8', (err, data) => {
            if (err) {
                callback(err.message);
            } else {
                callback(data);
            }
        });
    });

    socket.on('getImpressum', (callback) => {
        fs.readFile('impressum.html', 'utf-8', (err, data) => {
            if (err) {
                callback(err.message);
            } else {
                callback(data);
            }
        });
    });

    socket.on('getDatenschutz', (callback) => {
        fs.readFile('datenschutz.html', 'utf-8', (err, data) => {
            if (err) {
                callback(err.message);
            } else {
                callback(data);
            }
        });
    });
});

httpServer.listen(config.webserverPort, () => {
    console.log('server listening on *:' + config.webserverPort);
    console.log();
});

function queryEntries(query, callback) {
    let begin = process.hrtime();
    searchEngine.search(query, (result, err) => {
        let end = process.hrtime(begin);

        if (err) {
            callback(result, err);
            return;
        }

        let searchEngineTime = (end[0] * 1e3 + end[1] / 1e6).toFixed(2);

        let queryInfo = {
            filmlisteTimestamp: filmlisteTimestamp,
            searchEngineTime: searchEngineTime,
            resultCount: result.result.length,
            totalResults: result.totalResults
        };

        callback({
            results: result.result,
            queryInfo: queryInfo
        }, err);
    });
}

function updateLoop() {
    console.log('loop');
    mediathekManager.updateFilmlisteIfUpdateAvailable((err) => {
        if (err) {
            console.error(err);
        } else {
            mediathekManager.getCurrentFilmlisteTimestamp((timestamp) => {
                filmlisteTimestamp = timestamp;
            });
        }

        setTimeout(() => updateLoop(), 2 * 60 * 1000);
    });
}

if (config.index) {
    setImmediate(() => updateLoop());
}
