import * as Redis from 'ioredis';
import { Utils } from './utils';
import { Entry } from '../../model';
import { RedisKeys } from './redis-keys';
import { FilmlisteIndexer } from './filmliste-indexer';
import { DataStoreProvider } from './data-store/data-store-provider';

import { SearchEngine } from '../../search-engine/src/search-engine';
import { TextMapper, IntMapper, ArrayAnyMapper } from '../../search-engine/src/mapping';
import { RedisBackend, IntSerializer, BooleanSerializer } from '../../search-engine/src/redis';

import { Analyzer } from '../../search-engine/src/analyzing/analyzer';
import { WordTokenizer } from '../../search-engine/src/analyzing/tokenizing';
import { GreaterOrEqualComperator } from '../../search-engine/src/comperator';
import { LowerCaseTransformer, ASCIIFoldingTransformer } from '../../search-engine/src/analyzing/transforming';
import { StemmingTokenFilter, EdgeNGramTokenFilter, ASCIIFoldingTokenFilter } from '../../search-engine/src/analyzing/tokenizing/filtering';


let lowerCaseTransformer = new LowerCaseTransformer();
let asciiFoldingTransformer = new ASCIIFoldingTransformer();

let stemmingTokenFilter = new StemmingTokenFilter('german');
let edgeNGramTokenFilter = new EdgeNGramTokenFilter(3);
let asciiFoldingTokenFilter = new ASCIIFoldingTokenFilter();

let wordTokenizer = new WordTokenizer().addFilter(stemmingTokenFilter, asciiFoldingTokenFilter, edgeNGramTokenFilter);

let analyzer = new Analyzer(wordTokenizer).addTransformer(lowerCaseTransformer);

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

let dataStore = DataStoreProvider.getDataStore();
let entriesToBeAdded = dataStore.getSet<Entry>(RedisKeys.EntriesToBeAdded);
let entriesToBeRemoved = dataStore.getSet<Entry>(RedisKeys.EntriesToBeRemoved);
let filmlisteIndexer = new FilmlisteIndexer(searchEngine, entriesToBeAdded, entriesToBeRemoved);

async function loop() {
  await filmlisteIndexer.index();

  setTimeout(() => loop(), 3000);
}

loop();
