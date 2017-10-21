"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../../model");
const text_base_1 = require("./text-base");
class TopicSegmentConverter extends text_base_1.TextSegmentConverter {
    constructor() {
        super(/#|topic:/, 'and', model_1.Field.Topic);
    }
}
exports.TopicSegmentConverter = TopicSegmentConverter;
