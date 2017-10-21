"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../../model");
const text_base_1 = require("./text-base");
class ChannelSegmentConverter extends text_base_1.TextSegmentConverter {
    constructor() {
        super(/!|ch?a?n?n?e?l?:/, 'and', model_1.Field.Channel);
    }
}
exports.ChannelSegmentConverter = ChannelSegmentConverter;
