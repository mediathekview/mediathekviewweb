//var REDIS = require('redis');
var express = require('express');
var http = require('http');
var path = require('path');
var readline = require('readline');
var fs = require('fs');
var STREAM = require('stream');
var lineReader = require('line-reader');
var moment = require('moment');
var SearchEngine = require('./SearchEngine.js');

var app = express();
var httpServer = http.Server(app);
var io = require('socket.io')(httpServer);
var searchEngine = new SearchEngine();
//var redis = REDIS.createClient();

var data = [];
indexData('../fulldata');

app.use('/static', express.static('static'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

io.on('connection', (socket) => {
    let isSearching = false;
    let searchPending = false;
    let lastSearchString = '';

    socket.on('queryEntry', (query) => {
        let result = queryEntries(query);
        socket.emit('queryResult', result);
    });
});

httpServer.listen(8080, () => {
    console.log('server listening on *:8080');
});

function queryEntries(query) {
  console.log('querying ' + query);
    let begin = Date.now();

    let results = searchEngine.search(query).sort((a, b) => {
        let relevanceDiff = b.relevance - a.relevance;
        if (relevanceDiff == 0) {
            let aMoment = moment.unix(a.data.timestamp);
            let bMoment = moment.unix(b.data.timestamp);

            if (aMoment.isSameOrAfter(bMoment))
                return -1;
            else
                return 1;
        } else {
            return relevanceDiff;
        }
    }).slice(0, 50);

    console.log('query took ' + (Date.now() - begin) / 1000 + ' seconds');

    return results;
}

/*"X" : [ "Sender", "Thema", "Titel", "Datum", "Zeit", "Dauer", "Größe [MB]", "Beschreibung", "Url", "Website", "Url Untertitel", "Url RTMP", "Url Klein", "Url RTMP Klein", "Url HD", "Url RTMP HD", "DatumL", "Url History", "Geo", "neu" ] */
var indexRegex = /"X" : \[ "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)" ]/;

function indexData(file, endCallback) {
    var totalLines = 0;

    var begin = Date.now();
    lineReader.eachLine(file, function(line, last) {
        var match = indexRegex.exec(line);
        if (match != null) {
            var entry = {
                channel: match[1],
                topic: match[2],
                title: match[3],
                date: match[4],
                time: match[5],
                timestamp: moment(match[4] + match[5], 'DD.MM.YYYYHHmm').unix(),
                duration: match[6],
                size: match[7] * 1000000, //MB to bytes
                description: match[8],
                urls: {
                    video: match[9],
                    website: match[10],
                    subtitle: match[11],
                    rtmp: match[12],
                    video_short: match[13],
                    rtmp_short: match[14],
                    hd: match[15],
                    rtmp_hd: match[16],
                    history: match[18],
                },
                dateL: match[17],
                geo: match[19],
                new: match[20]
            };

            entry.id = ++totalLines;
            searchEngine.add(entry.title, entry);
            //data.push(entry);
        }

        if (last) {
            console.log('indexing took ' + (Date.now() - begin) / 1000 + ' seconds');
            console.log('indexed ' + totalLines + ' entries');
        }
    });
}
