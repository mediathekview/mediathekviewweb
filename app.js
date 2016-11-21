const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const SearchEngine = require('./SearchEngine.js');
const MediathekIndexer = require('./MediathekIndexer.js');
const Hjson = require('hjson');

const config = Hjson.parse(fs.readFileSync('config.hjson', 'utf8'));
console.log(config);

var app = express();
var httpServer = http.Server(app);
var io = require('socket.io')(httpServer);
var searchEngine = new SearchEngine(config.redis.host, config.redis.port, config.redis.password, config.redis.db1, config.redis.db2);
var mediathekIndexer = new MediathekIndexer(config.redis.host, config.redis.port, config.redis.password, config.redis.db1, config.redis.db2);
var websiteNames = [];

var serverStarted = false;
var workerStates = [];

function startServer() {
    app.use('/static', express.static('static'));

    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname + '/index.html'));
    });

    io.on('connection', (socket) => {
        socket.on('queryEntry', (query) => {
            queryEntries(query.queryString, query.mode, query.filters, (result) => {
                socket.emit('queryResult', result);
            });
        });
        socket.on('getWebsiteNames', () => {
            searchEngine.getWebsiteNames((result) => {
                socket.emit('websiteNames', result);
                websiteNames = result;
            });
        });
    });

    httpServer.listen(config.webserverPort, () => {
        console.log('server listening on *:' + config.webserverPort);
    });

    function queryEntries(query, mode, filters, callback) {
        console.log('querying ' + query);
        let begin = Date.now();

        searchEngine.search(query, config.min_word_size, mode, (results, err) => {
            if (err) {
                console.log(err);
                callback([]);
                return;
            }

            let searchEngineTime = Date.now() - begin;
            begin = Date.now();
            let resultCount = results.length;

            if (filters.websiteNames.length != websiteNames.length) {
                results = results.filter((entry) => {
                    return filters.websiteNames.includes(entry.data.websiteName);
                });
            }

            results = results.sort((a, b) => {
                let relevanceDiff = b.relevance - a.relevance;
                if (relevanceDiff == 0) {
                    return b.data.timestamp - a.data.timestamp;
                } else {
                    return relevanceDiff;
                }
            }).slice(0, 50);

            let filterTime = Date.now() - begin;
            let queryInfo = {
                searchEngineTime: searchEngineTime,
                filterTime: filterTime,
                resultCount: resultCount
            };

            callback({
                results: results,
                queryInfo: queryInfo
            });

            console.log('query took ' + (Date.now() - begin) / 1000 + ' seconds');

        });
    }
}

if (config.index) {
    mediathekIndexer.indexFile('../fulldata', config.min_word_size);
} else {
    startServer();
}

mediathekIndexer.on('workerState', (workerIndex, state) => {
    workerStates[workerIndex] = state;
    logWorkerStates();

    for (var i = 0; i < workerStates.length; i++) {
        if (workerStates[i] == undefined)
            return;

        if (!workerStates[i].done)
            return;
    }

    if (!serverStarted) {
        serverStarted = true;
        startServer();
    }
});

function logWorkerStates() {
    for (var i = 0; i < workerStates.length; i++) {
        let state = workerStates[i];

        if (state == null) continue;

        let num = i + 1;

        console.log('worker ' + num + ': ');
        console.log('\tprogress: ' + (state.progress * 100).toFixed(2) + '%');
        console.log('\tentries: ' + state.entries);
        console.log('\tindices: ' + state.indices);
        console.log('\ttime: ' + (state.time / 1000) + ' seconds');
    }
}
