import { SearchStringParser } from "./common/search-string-parser/parser";


const parser = new SearchStringParser();

const query = parser.parse('!ARD');

console.log(JSON.stringify(query, null, 2));