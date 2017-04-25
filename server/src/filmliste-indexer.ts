import { RedisService } from './redis-service';
import { ElasticsearchService } from './elasticsearch-service';

import { Entry } from './model';

const IN_BUFFER_SIZE: number = 400;
const IN_BUFFER_FILL_MARK: number = 150;
const OUT_BUFFER_SIZE: number = 250;

const WORK_PER_LOOP: number = 50; //to prevent blocking redis for to long

let redisService: RedisService = RedisService.getInstance();
let elasticsearchService: ElasticsearchService = ElasticsearchService.getInstance();

let addedBuffer: string[] = [];
let removedBuffer: string[] = [];
let outBuffer: any[] = [];

let isFlushing: boolean = false;

let currentLoopDelay = 10;

function fillBuffers() {
  if (addedBuffer.length < IN_BUFFER_FILL_MARK) {
    redisService.getEntriesToBeAddedBatch(IN_BUFFER_SIZE - addedBuffer.length).then((rawEntries) => {
      addedBuffer = addedBuffer.concat(rawEntries);
    }).catch((err) => {
      console.error(err);
    });
  }

  if (removedBuffer.length < IN_BUFFER_FILL_MARK) {
    redisService.getEntriesToBeRemovedBatch(IN_BUFFER_SIZE - removedBuffer.length).then((rawEntries) => {
      removedBuffer = removedBuffer.concat(rawEntries);
    }).catch((err) => {
      console.error(err);
    });
  }
}

function addEntries() {
  for (let i = 0; (i < WORK_PER_LOOP) && (addedBuffer.length > 0); i++) {
    let entry: Entry = JSON.parse(addedBuffer.pop());
    entry.removed = null;
    outBuffer.push({
      update: {
        _index: 'filmliste',
        _type: 'entries',
        _id: entry.id
      }
    });
    outBuffer.push({ doc: entry });
  }
}

function removeEntries() {
  for (let i = 0; (i < WORK_PER_LOOP) && (removedBuffer.length > 0); i++) {
    let entry: Entry = JSON.parse(removedBuffer.pop());
    outBuffer.push({
      update: {
        _index: 'filmliste',
        _type: 'entries',
        _id: entry.id
      }
    });
    outBuffer.push({ doc: { removed: Math.floor(Date.now() / 1000) } });
  }
}

function flushOutBuffer() {
  if (isFlushing || outBuffer.length == 0) {
    return;
  }

  isFlushing = true;
  elasticsearchService.bulk({ body: outBuffer })
    .then(() => {
      isFlushing = false;
    })
    .catch((error) => {
      console.error(error);
      isFlushing = false;
    });
}

function loop() {
  fillBuffers();

  if (addedBuffer.length == 0 && removedBuffer.length == 0 && outBuffer.length == 0) {
    if (currentLoopDelay < 2000) {
      currentLoopDelay *= 1.2;
    }

    setTimeout(() => loop(), currentLoopDelay);
    return;
  }

  currentLoopDelay = 0;

  addEntries();
  removeEntries();
  flushOutBuffer();

  setTimeout(() => loop(), 0);
}

loop();
