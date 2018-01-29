import { Segment, SegmentConverter, SegmentConverterResult } from '../';
import { QueryBody, TextQuery } from '../../search-engine/index';
import { Field } from '../../model/index';
import { SelectorSegmentConverterBase } from './selector-base';

const SELECTOR_REGEX = /^ch(a(n(n(e(l)?)?)?)?)?$/;

export class ChannelSegmentConverter extends SelectorSegmentConverterBase implements SegmentConverter {
    constructor() {
        super(SELECTOR_REGEX);
    }

    protected textToQuery(text: string): QueryBody {
        const query: TextQuery = {
            text: {
                fields: [Field.Channel],
                text: text,
                operator: 'and'
            }
        }

        return query;
    }
}