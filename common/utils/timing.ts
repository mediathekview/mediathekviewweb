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
export function cancelableTimeout(cancelPromise: Promise<void>, milliseconds: number): Promise<boolean>;
export function cancelableTimeout(cancelPromise: Promise<void>, milliseconds: number = 0): Promise<boolean> {
  let resolved = false;

  return new Promise<boolean>(async (resolve) => {
    const timer = setTimeout(() => {
      if (!resolved) {
        resolve(false);
        resolved = true;
      }
    }, milliseconds);

    await cancelPromise;
    if (!resolved) {
      clearTimeout(timer);
      resolve(true);
      resolved = true;
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
export function idle(timeout: number): Promise<IdleDeadline>
export function idle(timeout?: number): Promise<IdleDeadline> {
  return new Promise<IdleDeadline>((resolve) => requestIdleCallback(resolve, { timeout }));
}
