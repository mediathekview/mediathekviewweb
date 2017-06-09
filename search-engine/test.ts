import * as Redis from 'ioredis';


let redis = new Redis();


let counter = 0;

function loop() {
  let arr = [];
  for (let j = 0; j < 100; j++) {
    arr.push(0);
    arr.push(Math.floor(Math.random() * 1000000000));
  }

  redis.zadd('key', ...arr);

  if (++counter < 5000)
    setTimeout(() => loop(), 0);
}

loop();
