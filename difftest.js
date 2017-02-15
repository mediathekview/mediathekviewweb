const REDIS = require('redis');
const lineReader = require('line-reader');
const fs = require('fs');
const cp = require('child_process');
const IPC = require('./IPC.js');

let filmlisteParser = cp.fork('./FilmlisteParser.js', {
    execArgv: ['--optimize_for_size', '--memory-reducer']
});

ipc = new IPC(filmlisteParser);

ipc.send('parseFilmliste', {
    file: '../filmliste',
    setKey: 'newFilmlisteEntries',
    timestampKey: 'newFilmlisteTimestamp'
});
