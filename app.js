const express = require('express');
const http = require('http');
const https = require('https');
const URL = require('url');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const SearchEngine = require('./SearchEngine.js');
const REDIS = require('redis');
const MediathekIndexer = require('./MediathekIndexer.js');
const Hjson = require('hjson');
const exec = require('child_process').exec;
const PiwikTracker = require('piwik-tracker');
const utils = require('./utils.js');
const request = require('request');
const compression = require('compression');

const config = Hjson.parse(fs.readFileSync('config.hjson', 'utf8'));
config.mediathekUpdateInterval = parseFloat(config.mediathekUpdateInterval) * 60;
if (config.redis.password === '') {
    delete config.redis.password; //to prevent warning message
}
if (config.redis2.password === '') {
    delete config.redis2.password; //to prevent warning message
}

var redis = REDIS.createClient(config.redis2);
redis.on('error', (err) => {
    console.error(err);
});

var sql;
if (config.postgres.enabled) {
    sql = require('./postgres.js');
    sql.init(config.postgres);
    sql.createQueriesTable();
}

if (config.piwik.enabled) {
    var piwik = new PiwikTracker(config.piwik.siteId, config.piwik.piwikUrl);
}

var app = express();
var httpServer = http.Server(app);
var io = require('socket.io')(httpServer);

var elasticsearchSettings = JSON.stringify(config.elasticsearch);

var searchEngine = new SearchEngine(JSON.parse(elasticsearchSettings));
var mediathekIndexer = new MediathekIndexer(config.workerCount, config.redis, JSON.parse(elasticsearchSettings));
var websiteNames = [];

var indexing = false;
var lastIndexingState;

if (!!piwik) {
    piwik.on('error', function(err) {
        console.log('piwik: error tracking request: ', err)
    });
}

app.use(compression());
app.use('/static', express.static('static'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/impressum', function(req, res) {
    res.sendFile(path.join(__dirname + '/impressum.html'));
});
app.get('/datenschutz', function(req, res) {
    res.sendFile(path.join(__dirname + '/datenschutz.html'));
});

app.get('/api', (req, res) => {

    res.header('Access-Control-Allow-Origin', '*');

    if (req.query.action == 'search') {
        let begin = process.hrtime();
        searchEngine.search(req.query, (result, err) => {
            let end = process.hrtime(begin);

            if (err) {
                if (err[0] == 'cannot query while indexing') {
                    res.status(503);
                } else {
                    res.status(500);
                }

                res.json({
                    result,
                    err
                });
                return;
            }

            let searchEngineTime = (end[0] * 1e3 + end[1] / 1e6).toFixed(2);

            let queryInfo = {
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
    } else {
        res.status(400).end();
    }
});

io.on('connection', (socket) => {
    var clientIp = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress.match(/(\d+\.?)+/g)[0];
    var socketUid = null;

    console.log('client connected, ip: ' + clientIp);

    if (indexing && lastIndexingState != null) {
        socket.emit('indexState', lastIndexingState);
    }

    socket.on('getContentLength', (url, callback) => {
        redis.get(url, (err, result) => {
            if (result) {
                callback(result);
            } else {
                request.head(url, (error, response, body) => {
                    let contentLength = response.headers['content-length'];
                    if (!contentLength) {
                        contentLength = -1;
                    }

                    callback(contentLength);
                    redis.set(url, contentLength);
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

            if (!err && config.postgres.enabled) {
                sql.addQueryRow(query.queryString, result.queryInfo.searchEngineTime);
            }
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

mediathekIndexer.on('state', (state) => {
    lastIndexingState = state;
    io.sockets.emit('indexState', state);

    console.log();
    console.log('\tpprogress: ' + (state.parserProgress * 100).toFixed(2) + '%');
    console.log('\tiprogress: ' + (state.indexingProgress * 100).toFixed(2) + '%');
    console.log('\ttotalEntries: ' + state.totalEntries);
    console.log('\tentries: ' + state.entries);
    console.log('\tdone: ' + state.done);
    console.log('\ttime: ' + (state.time / 1000) + ' seconds');
    if (state.errorMessage) {
        console.log('\terror: ' + state.errorMessage);
    }


    if (state.done) {
        console.log();
    }
});

function deleteFileIfExist(file, callback) {
    fs.stat(file, (err, stats) => {
        if (!err) {
            fs.unlink(file, () => {
                callback();
            });
        } else {
            callback();
        }
    });
}

function downloadFilmliste(mirror, successCallback, errCallback) {
    let file = config.filmliste + '.xz';

    deleteFileIfExist(file, () => {
        let req = request.get(mirror);
        req.on('error', function(err) {
            errCallback(err);
        });

        let fileStream = fs.createWriteStream(file);
        req.pipe(fileStream);

        fileStream.on('error', (error) => {
            req.abort();
            errCallback(error);
        });

        req.on('end', () => {
            deleteFileIfExist(config.filmliste, () => {
                exec('unxz ' + config.filmliste + '.xz').on('exit', () => {
                    successCallback();
                });
            });
        });
    });
}

function indexMediathek(callback, errorCallback) {
    indexing = true;
    mediathekIndexer.indexFile(config.filmliste, callback, errorCallback);
}

function updateLoop() {
    if (!config.index) {
        return;
    }

    mediathekIndexer.checkUpdateAvailable((updateAvailable, mirror) => {
        if (updateAvailable) {
            console.log('downloading filmliste...');
            downloadFilmliste(mirror, () => {
                console.log('indexing filmliste...');
                indexMediathek(() => {
                    indexing = false;
                    console.log('indexing done');
                    setTimeout(updateLoop, 3 * 60 * 1000);
                }, () => {
                    indexing = false;
                    console.log('indexing error');
                    setTimeout(updateLoop, 3 * 60 * 1000);
                });
            }, (err) => {
                console.error('download error: ' + err.message);
                console.log('download failed...');
                console.log('trying again in 15 seconds');
                setTimeout(updateLoop, 15 * 1000);
            });
        } else {
            setTimeout(updateLoop, 3 * 60 * 1000);
        }
    });
}

setImmediate(updateLoop);
