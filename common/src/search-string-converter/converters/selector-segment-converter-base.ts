import { SegmentConverter, SegmentConverterResult, Segment } from '../';
import { QueryBody } from '../../search-engine/query';

export abstract class SelectorSegmentConverterBase implements SegmentConverter {
    private readonly selectorRegex: RegExp;

    constructor(selectorRegex: RegExp) {
        this.selectorRegex = selectorRegex;
    }

    canHandle(segment: Segment): boolean {
        return segment.selector != null && this.selectorRegex.test(segment.selector);
    }

    convert(segment: Segment): SegmentConverterResult {
        let result: SegmentConverterResult = {};
        const property = segment.inverted ? 'exclude' : 'include';

        const query = this.textToQuery(segment.text);
        result[property] = query;

        return result;
    }

    protected abstract textToQuery(text: string): QueryBody;
}