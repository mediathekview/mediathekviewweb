import { Action } from '@ngrx/store';

export abstract class PayloadAction<T> implements Action {
  abstract readonly type: string;
  readonly payload: T;

  constructor(payload: T) {
    this.payload = payload;
  }
}

export function createSimpleAction<T extends string>(type: T) {
  return class SimpleAction implements Action {
    readonly type: T = type;
  };
}

export function createPayloadAction<T extends string, P>(type: T) {
  return class PayloadAction implements Action {
    readonly type: T = type;
    readonly payload: P;

    constructor(payload: P) {
      this.payload = payload;
    }
  };
}
