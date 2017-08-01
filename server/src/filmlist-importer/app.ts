import * as FS from 'fs';
import { IEntry } from '../common';
import { FilmlistParser } from './filmlist-parser';

var filmlistParser = new FilmlistParser((metadata) => {
  console.log(metadata);
});

const fileStream = FS.createReadStream('/home/patrick/Downloads/filmlist', { encoding: 'utf-8' });

let count = 0;
fileStream.pipe(filmlistParser).on('data', (data: IEntry) => {
  if (++count % 1000 == 0) {
    console.log(count);
  }
}).on('end', () => console.log('end: ' + count));
