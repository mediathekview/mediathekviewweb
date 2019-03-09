declare const process: { nextTick(callback: () => any, ...args: any[]): void; };
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
export async function timeout(milliseconds: number = 0): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

export async function cancelableTimeout(milliseconds: number = 0, cancelPromise: PromiseLike<void>): Promise<boolean> {
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
      resolve(true);
    }
  });
}

export async function immediate(): Promise<void> {
  return new Promise<void>(setImmediate as (callback: () => void) => void);
}

export async function nextTick(): Promise<void> {
  return new Promise<void>((resolve) => process.nextTick(resolve));
}

export async function animationFrame(): Promise<number> {
  return new Promise<number>(requestAnimationFrame);
}

export async function idle(timeout?: number): Promise<IdleDeadline> {
  return new Promise<IdleDeadline>((resolve) => requestIdleCallback(resolve, { timeout }));
}
