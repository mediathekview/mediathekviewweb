import { Subject } from 'rxjs';

import { LockProvider } from '../common/lock';
import { ResetPromise, Timer, timeout } from '../common/utils';
import { LoopController } from './controller';

export type LoopFunction = (controller: LoopController) => Promise<void>;

export class DistributedLoop {
  private readonly key: string;
  private readonly lockProvider: LockProvider;
  private readonly throwError: boolean;
  private readonly stoppedPromise: ResetPromise<void>;

  constructor(key: string, lockProvider: LockProvider, throwError: boolean = true) {
    this.key = `loop:${key}`;
    this.lockProvider = lockProvider;
    this.throwError = throwError;
    this.stoppedPromise = new ResetPromise();
  }

  run(func: LoopFunction, interval: number, accuracy: number): LoopController {
    let stop = false;
    let pause = new ResetPromise<void>().resolve();
    let errorSubject = new Subject<void>();

    const controller: LoopController = {
      stop: () => { stop = true; return this.stoppedPromise; },
      pause: () => pause.reset(),
      resume: () => pause.resolve(),
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
        await pause;

        timer.restart();

        const success = await lock.acquire(0);
        const acquireDuration = timer.milliseconds;

        if (success) {
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

      this.stoppedPromise.resolve();
    })();

    return controller;
  }
}
