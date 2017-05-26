import * as Redis from 'ioredis';

let redis = new Redis();

redis.set('key', true);
redis.get('key',(err, res) => {
  console.log(err, res == true.toString() );
});
