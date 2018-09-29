import crypto from 'crypto';
import elasticsearch from 'elasticsearch';
import REDIS from 'redis';
import config from './config.js';
import IPC from './IPC.js';

const ipc = new IPC(process);

const redis = REDIS.createClient(config.redis);
const searchClient = new elasticsearch.Client(config.elasticsearch);

redis.on('error', (err) => handleError(err));

const bufferLength = 150,
  fillLength = 50,
  flushLength = 75;

let addedBuffer = [],
  removedBuffer = [],
  outBuffer = [];

let noNewAdded = false,
  noNewRemoved = false;

let bufferFlushPending = false;
let isFlushing = false;
let error = false;

let addedEntries = 0,
  removedEntries = 0;

let filmlisteTimestamp = 0;

function handleError(err) {
  error = true;
  ipc.send('error', err.message);
  redis.quit();
  setTimeout(() => process.exit(1), 500);
}

function index() {
  fillInBuffer();
  redis.get('mediathekIndexer:newFilmlisteTimestamp', (err, timestamp) => {
    if (err) {
      handleError(err);
    } else {
      filmlisteTimestamp = timestamp as any;
      processEntry();
    }
  });
}

function fillInBuffer() {
  if (noNewAdded && noNewRemoved) {
    return;
  }

  if (noNewAdded == false && addedBuffer.length < fillLength) {
    let addedBufferSpace = bufferLength - addedBuffer.length;
    redis.spop('mediathekIndexer:addedEntries', addedBufferSpace, (err, result) => {
      if (err) {
        handleError(err);
      } else {
        if (result.length > 0) {
          addedBuffer = addedBuffer.concat(result);
        } else if (addedBufferSpace > 0) {
          noNewAdded = true;
        }
      }
    });
  }

  if (noNewRemoved == false && removedBuffer.length < fillLength) {
    let removedBufferSpace = bufferLength - removedBuffer.length;
    redis.spop('mediathekIndexer:removedEntries', removedBufferSpace, (err, result) => {
      if (err) {
        handleError(err);
      } else {
        if (result.length > 0) {
          removedBuffer = removedBuffer.concat(result);
        } else if (removedBufferSpace > 0) {
          noNewRemoved = true;
        }
      }
    });
  }
}

function md5(stringOrBuffer) {
  return crypto.createHash('sha256').update(stringOrBuffer).digest('base64');
}

function processEntry() {
  if (error) {
    return;
  }

  fillInBuffer();

  if (addedBuffer.length == 0 && removedBuffer.length == 0) {
    if (noNewAdded && noNewRemoved) {
      finalize();
      return;
    } else {
      setTimeout(() => processEntry(), 10); //wait for fresh data
      return;
    }
  }

  if (outBuffer.length >= bufferLength) {
    setTimeout(() => processEntry(), 10);
    return;
  }

  if (addedBuffer.length > 0) {
    let rawEntry = addedBuffer.pop();
    let parsedEntry = JSON.parse(rawEntry);
    parsedEntry.filmlisteTimestamp = filmlisteTimestamp;

    outBuffer.push({
      index: {
        _index: 'filmliste',
        _type: 'entries',
        _id: md5(rawEntry)
      }
    });
    outBuffer.push(parsedEntry);
    addedEntries++;
  } else if (removedBuffer.length > 0) {
    let rawEntry = removedBuffer.pop();

    outBuffer.push({
      delete: {
        _index: 'filmliste',
        _type: 'entries',
        _id: md5(rawEntry)
      }
    });
    removedEntries++;
  }

  if (outBuffer.length >= flushLength) {
    flushOutBuffer();
  }

  setImmediate(() => processEntry());
}

function finalize() {
  flushOutBuffer();

  redis.quit(() => {
    done();
  });
}

function done() {
  if (isFlushing == false && bufferFlushPending == false) {
    ipc.send('done');
    setTimeout(process.exit(0), 500);
  } else {
    setTimeout(() => done(), 10);
  }
}

function flushOutBuffer() {
  if (outBuffer.length == 0) {
    bufferFlushPending = false;
    return;
  }

  if (!isFlushing) {
    bufferFlushPending = false;
    isFlushing = true;

    searchClient.bulk({
      body: outBuffer
    }, (err, resp) => {
      if (err) {
        handleError(err);
      }

      isFlushing = false;

      if (bufferFlushPending) {
        setImmediate(() => flushOutBuffer(), 10);
      }

      notifyState();
    });

    outBuffer = [];
  } else if (!bufferFlushPending) {
    bufferFlushPending = true;
  }
}

function notifyState() {
  ipc.send('state', {
    addedEntries: addedEntries,
    removedEntries: removedEntries
  });
}

index();
