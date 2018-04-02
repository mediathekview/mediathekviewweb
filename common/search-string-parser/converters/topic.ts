import { SegmentConverter } from '../';
import { Field } from '../../model';
import { Operator, QueryBody } from '../../search-engine';
import { TextQueryBuilder } from '../../search-engine/query/builder';
import { SelectorSegmentConverterBase } from './selector-segment-converter-base';

const FIELD = Field.Topic;
const SELECTOR_REGEX = /^(?:to(?:p(?:i(?:c)?)?)?|th(?:e(?:m(?:a)?)?)?|#)$/;

export class TopicSegmentConverter extends SelectorSegmentConverterBase implements SegmentConverter {
    constructor() {
        super(FIELD, SELECTOR_REGEX);
    }

    protected textToQuery(text: string): QueryBody {
        const builder = new TextQueryBuilder();
        const query = builder.fields(FIELD).text(text).operator(Operator.And).build();

        return query;
    }
}