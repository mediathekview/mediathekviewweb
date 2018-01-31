import { SegmentConverter, SegmentConverterResult, Segment } from '../';
import { QueryBody } from '../../search-engine/query';

export abstract class SelectorSegmentConverterBase implements SegmentConverter {
    private readonly selectorRegex: RegExp;

    constructor(selectorRegex: RegExp) {
        this.selectorRegex = selectorRegex;
    }

    tryConvert(segment: Segment): SegmentConverterResult | null {
        const canHandleSelector = this.canHandleSelector(segment);

        if (!canHandleSelector) {
            return null;
        }

        let result: SegmentConverterResult | null = null;

        const query = this.textToQuery(segment.text);

        if (query != null) {
            result = {};

            const property = segment.inverted ? 'exclude' : 'include';
            result[property] = query;
        }

        return result;
    }

    private canHandleSelector(segment: Segment): boolean {
        return segment.selector != null && this.selectorRegex.test(segment.selector);
    }

    protected abstract textToQuery(text: string): QueryBody | null;
}