import { SegmentConverter } from '../';
import { QueryBody } from '../../search-engine/index';
import { Field } from '../../model/index';
import { SelectorSegmentConverterBase } from './selector-segment-converter-base';
import { TextQueryBuilder } from '../../search-engine/query/builder';

const FIELD = Field.Title;
const SELECTOR_REGEX = /^(?:ti(?:t(?:(?:l(?:e)?)|(?:e(?:l)?))?)?|\+)$/;

export class TitleSegmentConverter extends SelectorSegmentConverterBase implements SegmentConverter {
    constructor() {
        super(FIELD, SELECTOR_REGEX);
    }

    protected textToQuery(text: string): QueryBody {
        const builder = new TextQueryBuilder();
        const query = builder.fields(FIELD).text(text).operator('and').build();

        return query;
    }
}