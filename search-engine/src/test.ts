import { SearchEngine } from './search-engine';
import { RedisBackend, IntSerializer, BooleanSerializer } from './redis';
import * as Redis from 'ioredis';

import { LowerCaseTransformer, ASCIIFoldingTransformer } from './analyzing/transforming';
import { WordTokenizer } from './analyzing/tokenizing';
import { StemmingTokenFilter, EdgeNGramTokenFilter, ASCIIFoldingTokenFilter } from './analyzing/tokenizing/filtering';
import { Analyzer } from './analyzing/analyzer';
import { TextMapper, IntMapper, ArrayAnyMapper } from './mapping';
import { Entry, IVideo } from '../../model/';
import { Utils } from './utils';
import { GreaterOrEqualComperator } from './comperator';

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
  'timestamp': new IntSerializer(10),
  'duration': new IntSerializer(10),
  'hasHD': new BooleanSerializer()
});

let searchEngine = new SearchEngine<Entry>(redisBackend, {
  'title': new TextMapper('title', analyzer),
  'topic': new TextMapper('topic', analyzer),
  'channel': new TextMapper('channel', analyzer),
  'description': new TextMapper('description', analyzer),
  'website': new TextMapper('website', analyzer),
  'timestamp': new IntMapper('timestamp'),
  'duration': new IntMapper('duration'),
  'hasHD': new ArrayAnyMapper('media', 'quality', new GreaterOrEqualComperator(), [5])
});

let video: IVideo = {
  type: 1,
  quality: 6,
  url: '',
  size: null
}

let entry: Entry = {
  title: 'test titel',
  timestamp: 453452435,
  topic: 'bla topic',
  channel: 'bla channel',
  duration: 12345,
  description: 'a long description which could be there',
  website: '',
  media: [video]
}

searchEngine.index([entry], ['blaErstesEntry']);
