import { SearchStringParser } from "./common/search-string-parser/parser";


const parser = new SearchStringParser();

const query = parser.parse('channel:NDR ^!ard #"sturm der liebe" *streit +"folge 1234" duration:30s-2m duration:>=40m');

const queryString = JSON.stringify(query, null, 1);

console.log(queryString);