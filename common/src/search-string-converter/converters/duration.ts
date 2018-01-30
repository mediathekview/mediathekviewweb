import { SegmentConverter } from '../';
import { QueryBody } from '../../search-engine/index';
import { Field } from '../../model/index';
import { SelectorSegmentConverterBase } from './selector-segment-converter-base';
import { TextQueryBuilder, TimeQueryValueBuilder } from '../../search-engine/query/builder';

const SELECTOR_REGEX = /^du(r(a(t(i(o(n)?)?)?)?)?)?$/;

export class DurationSegmentConverter extends SelectorSegmentConverterBase implements SegmentConverter {
    constructor() {
        super(SELECTOR_REGEX);
    }

    protected textToQuery(text: string): QueryBody {
        const builder = new TimeQueryValueBuilder();
        const query = builder.(Field.Duration).text(text).operator('and').build();

        return query;
    }
}