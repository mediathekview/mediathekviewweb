import { LowerCaseTransformer, ASCIIFoldingTransformer } from './transforming';
import { WordTokenizer } from './tokenizing';
import { StemmingTokenFilter, EdgeNGramTokenFilter, ASCIIFoldingTokenFilter } from './tokenizing/filtering';
import { Analyzer } from './analyzer';

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
