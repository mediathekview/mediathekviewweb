const express = require('express');
const http = require('http');
const path = require('path');
const moment = require('moment');
const SearchEngine = require('./SearchEngine.js');
const MediathekIndexer = require('./MediathekIndexer.js');

var app = express();
var httpServer = http.Server(app);
var io = require('socket.io')(httpServer);
var searchEngine = new SearchEngine();
var mediathekIndexer = new MediathekIndexer();

mediathekIndexer.indexFile('../fulldata', 4);

var workerStates = [];

mediathekIndexer.on('workerState', (workerIndex, state) => {
    workerStates[workerIndex] = state;
    logWorkerStates();
});

function logWorkerStates() {
    for (var i = 0; i < workerStates.length; i++) {
        let state = workerStates[i];

          if (state == null) continue;

        let num = i + 1;

        console.log('worker ' + num + ': ');
        console.log('\tprogress '  + ': ' + (state.progress * 100) + '%');
        console.log('\tentries ' + ': ' + state.entries);
        console.log('\tindices '  + ': ' + state.indices);
        console.log('\ttime '+ ': ' + (state.time / 1000) + ' seconds');
    }
}

app.use('/static', express.static('static'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

io.on('connection', (socket) => {
    socket.on('queryEntry', (query) => {
        queryEntries(query, 'and', (result) => {
            socket.emit('queryResult', result);
        });
    });
});

httpServer.listen(8080, () => {
    console.log('server listening on *:8080');
});

function queryEntries(query, mode, callback) {
    console.log('querying ' + query);
    let begin = Date.now();

    searchEngine.search(query, mode, 4, (result) => {
      return;
        result = result.sort((a, b) => {
            let relevanceDiff = b.relevance - a.relevance;
            if (relevanceDiff == 0) {
                console.log(a);
                console.log(b);
                let aMoment = moment.unix(a.data.timestamp);
                let bMoment = moment.unix(b.data.timestamp);

                if (aMoment.isSameOrAfter(bMoment))
                    return -1;
                else
                    return 1;
            } else {
                return relevanceDiff;
            }
        }).slice(0, 50); //Math.min(50, result.length));

        console.log(result);

        console.log('query took ' + (Date.now() - begin) / 1000 + ' seconds');

        callback(result);
    });
}
