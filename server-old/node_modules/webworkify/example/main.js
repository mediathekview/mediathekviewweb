var work = require('../');

var w = work(require('./worker.js'));
w.addEventListener('message', function (ev) {
    console.log(ev.data);
});

w.postMessage(4); // send the worker a message
