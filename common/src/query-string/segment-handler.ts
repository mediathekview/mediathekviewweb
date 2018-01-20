import { QueryBody } from '../search-engine';

export abstract class SegmentHandler {
  private queryCache: Map<string, QueryBody> = new Map();

  protected abstract _buildQuery(text: string): QueryBody;

  abstract canHandle(text: string): boolean;
  abstract validate(text: string): boolean;

  buildQuery(text: string): QueryBody {
    const cachedQuery = this.queryCache.get(text);
    if (cachedQuery != undefined) {
      return cachedQuery;
    }

    const canHandle = this.canHandle(text);
    const valid = this.validate(text);

    if (!canHandle) {
      throw new Error('cannot handle text');
    }

    if (!valid) {
      throw new Error('text not valid');
    }

    const query = this._buildQuery(text);

    this.queryCache.set(text, query);
    return query;
  }
}
