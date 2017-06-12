import { LowerCaseTransformer, ASCIIFoldingTransformer } from './analyzing/transforming';
import { WordTokenizer } from './analyzing/tokenizing';
import { StemmingTokenFilter, EdgeNGramTokenFilter, ASCIIFoldingTokenFilter } from './analyzing/tokenizing/filtering';
import { Analyzer } from './analyzing/analyzer';
import { TextMapper } from './mapping';

let lowerCaseTransformer = new LowerCaseTransformer();
let asciiFoldingTransformer = new ASCIIFoldingTransformer();

let stemmingTokenFilter = new StemmingTokenFilter('german');
let edgeNGramTokenFilter = new EdgeNGramTokenFilter(3);
let asciiFoldingTokenFilter = new ASCIIFoldingTokenFilter();

let wordTokenizer = new WordTokenizer().addFilter(stemmingTokenFilter, asciiFoldingTokenFilter, edgeNGramTokenFilter);


let analyzer = new Analyzer(wordTokenizer).addTransformer(lowerCaseTransformer, asciiFoldingTransformer);


let text = `Möin Die schwersten Unglücke der DDR (1) - Schuld ist nie der Sozialismus`;

let tokens;

let begin = Date.now();
for (let i = 0; i < 10000; i++) {
  tokens = analyzer.analyze(text);
}
let duration = Date.now() - begin;

console.log(tokens, duration);



let a = {
  'title': {
    type: 'text',
    mapper: new StringMapper(),
    index_analyzer: analyzer
  },
  'hasHD': {
    type: 'boolean',
    mapper: new ArrayAnyMapper()
  }
}
