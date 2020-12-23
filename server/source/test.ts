import { SearchStringParser } from '$shared/search-string-parser';

const parser = new SearchStringParser();

const query = parser.parse('-channel:ard !zdf #thema1 #thema2 "sturm der liebe"');
console.log(JSON.stringify(query, null, 2));
