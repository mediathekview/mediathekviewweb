import { LowerCaseTransformer, ASCIIFoldingTransformer } from './transforming';
import { WordTokenizer } from './tokenizing';
import { StemmingTokenFilter, EdgeNGramTokenFilter } from './tokenizing/filtering';

let lowerCaseTransformer = new LowerCaseTransformer();
let asciiFoldingTransformer = new ASCIIFoldingTransformer();

let stemmingTokenFilter = new StemmingTokenFilter('german');
let edgeNGramTokenFilter = new EdgeNGramTokenFilter(3);

let wordTokenizer = new WordTokenizer().addFilter(stemmingTokenFilter).addFilter(edgeNGramTokenFilter);





let text = `Mit Webseiten wie MediathekViewWeb[4] und MediathekDirekt.de[5] bestehen Oberflächen, die in jedem Webbrowser funktionieren und den Rückgriff auf Java überflüssig machen. Sie benutzen die von MediathekView erstellten Listen. MediathekViewWeb verzichtet zudem komplett auf ein Herunterladen von Filmlisten auf den lokalen Client und führt die Suche nach Sendungen serverseitig aus. Ein lokales Videoabspielprogramm wird nicht mehr benötigt, weil die Videos direkt auf der Website betrachtet werden können.
Seit Februar 2017 ist MediathekViewWeb und dessen Entwickler Teil der MediathekView-Organisation.`;

let tokens;

let begin = Date.now();
for (let i = 0; i < 100000; i++) {
  text = lowerCaseTransformer.transform(text);
  text = asciiFoldingTransformer.transform(text);

  tokens = wordTokenizer.tokenize(text);
}
let duration = Date.now() - begin;

console.log(tokens, duration);
