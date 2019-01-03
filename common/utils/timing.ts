declare const process: any;
declare function requestAnimationFrame(callback: FrameRequestCallback): number;
declare function requestIdleCallback(callback: IdleRequestCallback, options?: { timeout?: number }): void;
declare function setImmediate<T extends any[]>(callback: (...args: T) => void, ...args: T): any;

export type DOMHighResTimeStamp = number;
export type FrameRequestCallback = (time: number) => void;
export type IdleRequestCallback = (idleDeadline: IdleDeadline) => void;

export interface IdleDeadline {
  didTimeout: boolean;
  timeRemaining(): DOMHighResTimeStamp;
}

export function timeout(): Promise<void>;
export function timeout(milliseconds: number): Promise<void>;
export function timeout(milliseconds: number = 0): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

export function cancelableTimeout(cancelPromise: Promise<void>): Promise<boolean>;
export function cancelableTimeout(cancelPromise: Promise<void>, resolveOnCancel: boolean): Promise<boolean>;
export function cancelableTimeout(cancelPromise: Promise<void>, milliseconds: number): Promise<boolean>;
export function cancelableTimeout(cancelPromise: Promise<void>, milliseconds: number, resolveOnCancel: boolean): Promise<boolean>;
export function cancelableTimeout(cancelPromise: Promise<void>, millisecondsOrResolveOnCancel: number | boolean = 0, resolveOnCancel: boolean = true): Promise<boolean> {
  const milliseconds = (typeof millisecondsOrResolveOnCancel == 'number') ? millisecondsOrResolveOnCancel : 0;

  if (typeof millisecondsOrResolveOnCancel == 'boolean') {
    resolveOnCancel = millisecondsOrResolveOnCancel;
  }

  return new Promise<boolean>(async (resolve) => {
    let pending = true;

    const timer = setTimeout(() => {
      if (pending) {
        pending = false;
        resolve(false);
      }
    }, milliseconds);

    await cancelPromise;

    if (pending) {
      pending = false;
      clearTimeout(timer);

      if (resolveOnCancel) {
        resolve(true);
      }
    }
  });
}

export function immediate(): Promise<void> {
  return new Promise<void>((resolve) => setImmediate(resolve));
}

export function nextTick(): Promise<void> {
  return new Promise<void>((resolve) => process.nextTick(resolve));
}

export function animationFrame(): Promise<number> {
  return new Promise<number>((resolve) => requestAnimationFrame(resolve));
}

export function idle(): Promise<IdleDeadline>;
export function idle(timeout: number): Promise<IdleDeadline>;
export function idle(timeout?: number): Promise<IdleDeadline> {
  return new Promise<IdleDeadline>((resolve) => requestIdleCallback(resolve, { timeout }));
}
