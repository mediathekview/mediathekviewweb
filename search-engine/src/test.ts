import { SearchEngine } from './search-engine';
import { RedisBackend, IntSerializer } from './redis';
import * as Redis from 'ioredis';

import { LowerCaseTransformer, ASCIIFoldingTransformer } from './analyzing/transforming';
import { WordTokenizer } from './analyzing/tokenizing';
import { StemmingTokenFilter, EdgeNGramTokenFilter, ASCIIFoldingTokenFilter } from './analyzing/tokenizing/filtering';
import { Analyzer } from './analyzing/analyzer';
import { TextMapper, IntMapper} from './mapping';
import { Entry } from '../../model/';
import { Utils } from './utils';

let lowerCaseTransformer = new LowerCaseTransformer();
let asciiFoldingTransformer = new ASCIIFoldingTransformer();

let stemmingTokenFilter = new StemmingTokenFilter('german');
let edgeNGramTokenFilter = new EdgeNGramTokenFilter(3);
let asciiFoldingTokenFilter = new ASCIIFoldingTokenFilter();

let wordTokenizer = new WordTokenizer().addFilter(stemmingTokenFilter, asciiFoldingTokenFilter, edgeNGramTokenFilter);


let analyzer = new Analyzer(wordTokenizer).addTransformer(lowerCaseTransformer, asciiFoldingTransformer);


let text = `Möin Die schwersten Unglücke der DDR (1) - Schuld ist nie der Sozialismus`;

let redis = Redis();
let redisBackend = new RedisBackend(redis, {
  'timestamp': new IntSerializer(10)
});

let searchEngine = new SearchEngine<Entry>(redisBackend, {
  'title': new TextMapper('title', analyzer),
  'timestamp': new IntMapper('timestamp')
});

let entry: Entry = {
  title: 'test titel',
  timestamp: 453452435,
  topic: 'bla topic',
  channel: 'bla channel',
  duration: 12345,
  description: 'a long description which could be there',
  website: '',
  media: []
}

searchEngine.index([entry],['blaErstesEntry']);
