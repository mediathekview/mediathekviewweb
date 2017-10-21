"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../../model");
const text_base_1 = require("./text-base");
class DescriptionSegmentConverter extends text_base_1.TextSegmentConverter {
    constructor() {
        super(/\*|descr?i?p?t?i?o?n?:/, 'and', model_1.Field.Description);
    }
}
exports.DescriptionSegmentConverter = DescriptionSegmentConverter;
