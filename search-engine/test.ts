import * as Redis from 'ioredis';


let redis = new Redis();


let counter = 0;

function loop() {
  let arr = [];
  for (let j = 0; j < 100; j++) {
    arr.push(Math.floor(Math.random() * 10000000000000).toString());
  }

  redis.sadd('key', ...arr);

  console.log(counter * 100);

  if (++counter < 5000)
    setTimeout(() => loop(), 0);
}

loop();
