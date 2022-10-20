import crypto from 'crypto';
import elasticsearch from 'elasticsearch';
import config from './config';
import IPC from './IPC';
import { getRedisClient, initializeRedis } from './Redis';

const ipc = new IPC(process);

const searchClient = new elasticsearch.Client(config.elasticsearch);

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
  setTimeout(() => process.exit(1), 500);
}

async function index() {
  await initializeRedis();

  fillInBuffer();

  getRedisClient()
    .get('mediathekIndexer:newFilmlisteTimestamp')
    .then((timestamp) => {
      filmlisteTimestamp = timestamp as any;
      processEntry();
    })
    .catch((error) => handleError(error));
}

function fillInBuffer() {
  if (noNewAdded && noNewRemoved) {
    return;
  }

  const redis = getRedisClient();

  if (noNewAdded == false && addedBuffer.length < fillLength) {
    let addedBufferSpace = bufferLength - addedBuffer.length;
    redis.sPop('mediathekIndexer:addedEntries', addedBufferSpace)
      .then((result) => {
        if (result.length > 0) {
          addedBuffer = addedBuffer.concat(result);
        } else if (addedBufferSpace > 0) {
          noNewAdded = true;
        }
      })
      .catch((error) => handleError(error));
  }

  if (noNewRemoved == false && removedBuffer.length < fillLength) {
    let removedBufferSpace = bufferLength - removedBuffer.length;
    redis.sPop('mediathekIndexer:removedEntries', removedBufferSpace)
      .then((result) => {
        if (result.length > 0) {
          removedBuffer = removedBuffer.concat(result);
        } else if (removedBufferSpace > 0) {
          noNewRemoved = true;
        }
      })
      .catch(handleError);
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

  getRedisClient().quit().then(() => {
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
        setImmediate(() => flushOutBuffer());
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
