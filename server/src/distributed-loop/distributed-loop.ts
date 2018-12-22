import { Subject } from 'rxjs';
import { LockProvider } from '../common/lock';
import { Logger } from '../common/logger';
import { cancelableTimeout, DeferredPromise, Timer } from '../common/utils';
import { LoopController } from './controller';

export type LoopFunction = (controller: LoopController) => Promise<void>;

export class DistributedLoop {
  private readonly key: string;
  private readonly lockProvider: LockProvider;
  private readonly logger: Logger;
  private readonly throwError: boolean;

  constructor(key: string, lockProvider: LockProvider, logger: Logger)
  constructor(key: string, lockProvider: LockProvider, logger: Logger, throwError: boolean)
  constructor(key: string, lockProvider: LockProvider, logger: Logger, throwError: boolean = true) {
    this.key = `loop:${key}`;
    this.lockProvider = lockProvider;
    this.logger = logger;
    this.throwError = throwError;
  }

  run(func: LoopFunction, interval: number, accuracy: number): LoopController {
    const stopped = new DeferredPromise();
    const stopPromise = new DeferredPromise();
    const errorSubject = new Subject<void>();

    let stop = false;

    const controller: LoopController = {
      stop: async () => { stop = true; stopPromise.resolve(); await stopped; },
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

      try {
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
            await cancelableTimeout(stopPromise, timeLeft);

            try {
              await lock.release();
            }
            catch (error) {
              this.logger.error(error);
            }

            await cancelableTimeout(stopPromise, interval - acquireDuration);
          }
          else {
            await cancelableTimeout(stopPromise, accuracy - acquireDuration);
          }
        }
      }
      finally {
        stopped.resolve();
        await lock.release();
      }
    })();

    return controller;
  }
}
