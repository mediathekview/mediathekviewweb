"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const search_engine_1 = require("../search-engine");
const model_1 = require("../model");
class QueryStringParser {
    static parse(queryString) {
        const segments = this.segmentize(queryString);
        const query = this.queryize(segments);
        return query;
    }
    static queryize(segments) {
        const outerBoolQuery = new search_engine_1.BoolQueryBuilder();
        for (const segment of segments) {
            switch (segment.selector) {
                case '!':
                    const channelQuery = this.textToQueryBuilder(model_1.Field.Channel, segment.text, segment.regex);
                    outerBoolQuery.must(channelQuery);
                    break;
                case '#':
                    let topicQuery = this.textToQueryBuilder(model_1.Field.Topic, segment.text, segment.regex);
                    outerBoolQuery.must(topicQuery);
                    break;
                case '+':
                    let titleQuery = this.textToQueryBuilder(model_1.Field.Title, segment.text, segment.regex);
                    outerBoolQuery.must(titleQuery);
                    break;
                case '*':
                    let descriptionQuery = this.textToQueryBuilder(model_1.Field.Description, segment.text, segment.regex);
                    outerBoolQuery.must(descriptionQuery);
                    break;
                case '!':
                    break;
                case null:
                    break;
                default:
                    throw new Error(`parser for selector ${segment.selector} not implemented`);
            }
        }
        const query = outerBoolQuery.build();
        return query;
    }
    static textToQueryBuilder(fields, text, regex) {
        let queryBuilder;
        if (regex) {
            const regexQueryBuilder = queryBuilder = new search_engine_1.RegexQueryBuilder();
            regexQueryBuilder.fields(fields).expression(text).operator('or');
        }
        else {
            const textQueryBuilder = queryBuilder = new search_engine_1.TextQueryBuilder();
            textQueryBuilder.fields(fields).text(text).operator('and');
        }
        return queryBuilder;
    }
    static segmentize(queryString) {
        queryString = queryString.trim();
        const segments = [];
        for (let i = 0; i < queryString.length; i++) {
            const segment = { selector: null, text: '', regex: false };
            let segmentQuoteChar = null;
            let lastChar = null;
            for (; (queryString[i] != ' ' || segmentQuoteChar != null) && i < queryString.length; i++) {
                const char = queryString[i];
                const isQuoteChar = (QUOTE_CHARS.includes(char)) && (lastChar == null || lastChar != ESCAPE_CHAR);
                if (isQuoteChar && (segmentQuoteChar == null || char == segmentQuoteChar)) {
                    if (segmentQuoteChar != null) {
                        break;
                    }
                    else {
                        segmentQuoteChar = char;
                        if (char == REGEX_CHAR) {
                            segment.regex = true;
                        }
                    }
                }
                else {
                    segment.text += char;
                }
                lastChar = char;
            }
            if (segment.text.length > 0) {
                segments.push(segment);
            }
        }
        for (let selector in Selector) {
        }
        for (const segment of segments) {
            for (const selector in Selector) {
                if (segment.text.startsWith(selector)) {
                    segment.selector = selector;
                    segment.text = segment.text.slice(selector.length);
                    break;
                }
            }
        }
        return segments;
    }
}
exports.QueryStringParser = QueryStringParser;
