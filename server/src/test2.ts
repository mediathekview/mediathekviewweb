import { SearchStringParser } from "./common/search-string-parser/parser";


const parser = new SearchStringParser();

const query = parser.parse('!ARD ^!NDR topic:"Sturm der Liebe"');

const queryString = JSON.stringify(query, null, 1);

console.log(queryString);