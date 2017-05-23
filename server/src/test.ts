import * as Stream from 'stream';

let stream = new Stream.Readable({objectMode: true});

console.log(stream.readable);

stream.push(1);
stream.push(10);
stream.push(100);
stream.push(1000);

let item;
while((item = stream.read()) != null) {
  console.log(item);
}

console.log(stream.readable);
