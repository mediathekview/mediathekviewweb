import { LockProvider } from '../common/lock';
import { Logger } from '../common/logger';
import { cancelableTimeout, DeferredPromise, Timer } from '../common/utils';
import { LoopController } from './controller';

export type LoopFunction = (controller: LoopController) => Promise<void>;

export class DistributedLoop {
  private readonly key: string;
  private readonly lockProvider: LockProvider;
  private readonly logger: Logger;
  private readonly stopOnError: boolean;

  constructor(key: string, lockProvider: LockProvider, logger: Logger, stopOnError: boolean = true) {
    this.key = `loop:${key}`;
    this.lockProvider = lockProvider;
    this.logger = logger;
    this.stopOnError = stopOnError;
  }

  run(func: LoopFunction, interval: number, accuracy: number): LoopController {
    const stopped = new DeferredPromise();
    const stopPromise = new DeferredPromise();
    let loopError: Error | undefined;

    let stop = false;

    const stopFunction = async () => {
      if (!stop) {
        stop = true;
        stopPromise.resolve();
      }

      await stopped;
    };

    const controller: LoopController = {
      stop: stopFunction,
      stopped,
      error: loopError
    };

    // tslint:disable-next-line: no-floating-promises
    (async () => {
      const lock = this.lockProvider.get(this.key);
      const timer = new Timer();

      try {
        while (!stop) {
          try {
            timer.restart();

            await lock.acquire(0, async () => {
              await func(controller);

              const timeLeft = interval - timer.milliseconds;
              const timeoutDuration = timeLeft - (accuracy / 2);
              await cancelableTimeout(timeoutDuration, stopPromise);
            });

            await cancelableTimeout(accuracy, stopPromise);
          }
          catch (error) {
            if (this.stopOnError) {
              loopError = error as Error;
              return;
            }
            else {
              this.logger.error(error as Error);
              await cancelableTimeout(accuracy, stopPromise);
            }
          }
        }
      }
      finally {
        stopped.resolve();
      }
    })();

    return controller;
  }
}
