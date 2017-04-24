import { RedisService } from './redis-service';
import { ElasticsearchService } from './elasticsearch-service';

const IN_BUFFER_SIZE: number = 400;
const IN_BUFFER_FILL_MARK: number = 150;
const OUT_BUFFER_SIZE: number = 250;
const OUT_BUFFER_FLUSH_MARK: number = 50;

const WORK_PER_LOOP: number = 50; //to prevent blocking redis for to long

let redisService: RedisService = RedisService.getInstance();
let elasticsearchService: ElasticsearchService = ElasticsearchService.getInstance();

let addedBuffer: string[] = [];
let removedBuffer: string[] = [];

function fillBuffers() {
  if (this.addedBuffer.length < IN_BUFFER_FILL_MARK) {
    redisService.getEntriesToBeAddedBatch(IN_BUFFER_SIZE - addedBuffer.length).then((rawEntries) => {
      addedBuffer = addedBuffer.concat(rawEntries);
    }).catch((err) => {
      console.error(err);
    });
  }

  if (this.removedBuffer.length < IN_BUFFER_FILL_MARK) {
    redisService.getEntriesToBeRemovedBatch(IN_BUFFER_SIZE - removedBuffer.length).then((rawEntries) => {
      removedBuffer = removedBuffer.concat(rawEntries);
    }).catch((err) => {
      console.error(err);
    });
  }
}

function addEntries(rawEntries: string[]) {
  for (let i = 0; (i < WORK_PER_LOOP) && (addedBuffer.length > 0); i++) {
    
  }
}

function loop() {
  let rawEntry: string;

  setTimeout(() => loop(), 3000);
}

loop();
