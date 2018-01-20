import { QueryBody } from '../search-engine';
import { SegmentHandler } from './segment-handler';

export class Segment {
  private _text: string;

  private segmentHandlerCache: Map<string, SegmentHandler> = new Map();
  private segmentHandlers: SegmentHandler[];

  constructor(text: string, segmentHandlers: SegmentHandler[]) {
    this.text = text;
    this.segmentHandlers = segmentHandlers;
  }

  set text(text: string) {
    this._text = text;
  }

  get text(): string {
    return this._text;
  }

  validate(): boolean {
    const handler = this.getHandlerThrowOnNull();

    return handler.validate(this.text);
  }

  buildQuery(): QueryBody {
    const handler = this.getHandlerThrowOnNull();

    return handler.buildQuery(this.text);
  }

  private getHandlerThrowOnNull(): SegmentHandler {
    const handler = this.getHandler();

    if (handler == null) {
      throw new Error('no handler found');
    }

    return handler;
  }

  hasHandler(): boolean {
    const handler = this.getHandler();

    const canHandle = handler != null;
    return canHandle;
  }

  private getHandler(): SegmentHandler | null {
    const cachedHandler = this.segmentHandlerCache.get(this.text);
    if (cachedHandler != undefined) {
      return cachedHandler;
    }

    for (let handler of this.segmentHandlers) {
      const canHandle = handler.canHandle(this.text);

      if (canHandle) {
        this.segmentHandlerCache.set(this.text, handler);
        return handler;
      }
    }

    return null;
  }
}
