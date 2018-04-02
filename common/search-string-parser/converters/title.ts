import { SegmentConverter } from '../';
import { Field } from '../../model';
import { Operator, QueryBody } from '../../search-engine';
import { TextQueryBuilder } from '../../search-engine/query/builder';
import { SelectorSegmentConverterBase } from './selector-segment-converter-base';

const FIELD = Field.Title;
const SELECTOR_REGEX = /^(?:ti(?:t(?:(?:l(?:e)?)|(?:e(?:l)?))?)?|\+)$/;

export class TitleSegmentConverter extends SelectorSegmentConverterBase implements SegmentConverter {
    constructor() {
        super(FIELD, SELECTOR_REGEX);
    }

    protected textToQuery(text: string): QueryBody {
        const builder = new TextQueryBuilder();
        const query = builder.fields(FIELD).text(text).operator(Operator.And).build();

        return query;
    }
}