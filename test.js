const assert = require('assert');

const MediathekIndexer = require('./MediathekIndexer.js');
const path = require('path');
const URL = require('url');
const querystring = require('querystring');

let url = URL.parse('https://mediathekviewweb.de/feed?query=hallo');
let urlClone = {
    protocol: url.protocol,
    slashes: url.slashes,
    auth: url.auth,
    host: url.host,
    port: url.port,
    hostname: url.hostname,
    hash: url.query,
    pathname: '/'
};

console.log(url);
console.log(URL.format(urlClone));

process.exit();

let indexer = new MediathekIndexer();

indexer.on('state', (state) => {
    console.log();
    console.log(state);
});

indexer.indexFilmliste('../old', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('done');
    }
});
