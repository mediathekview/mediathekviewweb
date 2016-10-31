//var REDIS = require('redis');
var express = require('express');
var http = require('http');
var path = require('path');
var readline = require('readline');
var fs = require('fs');
var STREAM = require('stream');
var lineReader = require('line-reader');
var moment = require('moment');

var app = express();
var httpServer = http.Server(app);
var io = require('socket.io')(httpServer);
//var redis = REDIS.createClient();

var searchIndex;
var data = [];

const initIndex = function(err, index) {
    if (!err) {
        searchIndex = index;
        setImmediate(() => indexData('data'));
    } else {
        console.log(err);
    }
}
require('search-index')({}, initIndex);

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
    let begin = Date.now();

    let results = data.filter((entry) => {
        return entry.title.toLowerCase().includes(query);
    }).sort((a, b) => {
        let aMoment = moment(a.date + a.time, 'DD.MM.YYYYHHmm');
        let bMoment = moment(b.date + b.time, 'DD.MM.YYYYHHmm');
        if (aMoment.isSameOrAfter(bMoment)) return -1;
        else return 1;
    }).slice(0, 50);

    console.log('query took ' + (Date.now() - begin) / 1000 + ' seconds');

    return results;
}

/*"X" : [ "Sender", "Thema", "Titel", "Datum", "Zeit", "Dauer", "Größe [MB]", "Beschreibung", "Url", "Website", "Url Untertitel", "Url RTMP", "Url Klein", "Url RTMP Klein", "Url HD", "Url RTMP HD", "DatumL", "Url History", "Geo", "neu" ] */
var indexRegex = /"X" : \[ "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)", "(.*?)" ]/;

function indexData(file, endCallback) {
    let indexStream = new STREAM.PassThrough({
        objectMode: true
    });


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

            data.push(entry);
            //indexStream.push(entry);
        }

        if (last) {
            //indexStream.push(null);
            //indexStream.pipe(searchIndex.defaultPipeline()).pipe(searchIndex.add());

            /*setInterval(() => {
                searchIndex.tellMeAboutMySearchIndex(function(err, info) {
                    console.log(info)
                });
            }, 1000);*/

            console.log('indexing took ' + (Date.now() - begin) / 1000 + ' seconds');
            console.log('indexed ' + totalLines + ' entries');
        }
    });
}
