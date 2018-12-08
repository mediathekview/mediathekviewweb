import { Subject } from 'rxjs';
import { LockProvider } from '../common/lock';
import { DeferredPromise, timeout, Timer } from '../common/utils';
import { LoopController } from './controller';

export type LoopFunction = (controller: LoopController) => Promise<void>;

export class DistributedLoop {
  private readonly key: string;
  private readonly lockProvider: LockProvider;
  private readonly throwError: boolean;
  private readonly stopped: DeferredPromise<void>;

  constructor(key: string, lockProvider: LockProvider, throwError: boolean = true) {
    this.key = `loop:${key}`;
    this.lockProvider = lockProvider;
    this.throwError = throwError;
    this.stopped = new DeferredPromise();
  }

  run(func: LoopFunction, interval: number, accuracy: number): LoopController {
    let stop = false;
    let errorSubject = new Subject<void>();

    const controller: LoopController = {
      stop: () => { stop = true; return this.stopped; },
      setTiming: (timing) => {
        if (timing.interval != undefined) {
          interval = timing.interval;
        }
        if (timing.accuracy != undefined) {
          accuracy = timing.accuracy;
        }
      },

      error: errorSubject.asObservable()
    };

    (async () => {
      const lock = this.lockProvider.get(this.key);
      const timer = new Timer(true);

      while (!stop) {
        timer.restart();

        const acquired = await lock.acquire(0);
        const acquireDuration = timer.milliseconds;

        if (acquired) {
          try {
            await func(controller);
          }
          catch (error) {
            errorSubject.next(error);

            if (this.throwError) {
              throw error;
            }
          }

          const timeLeft = interval - timer.milliseconds;
          await timeout(timeLeft);
          await lock.release();

          await timeout(interval - acquireDuration);
        }
        else {
          await timeout(accuracy - acquireDuration);
        }
      }

      this.stopped.resolve();
    })();

    return controller;
  }
}
