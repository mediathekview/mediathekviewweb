import { ILockProvider, ILock } from '../lock';
import { sleep } from '../utils';
import { EventEmitter } from 'events';

export class DistributedLoop extends EventEmitter {
  constructor(private key: string, private lockProvider: ILockProvider) {
    super();
  }

  async run(loop: (stop?: () => void) => Promise<void>, interval: number | (() => number)) {
    let stop = false;

    let stopFunction = () => stop = true;

    const lock = this.lockProvider.getLock(this.key);

    while (!stop) {
      try {
        const hasLock = await lock.lock();
        if (hasLock) {
          await loop(stopFunction);
        }
      } catch (error) {
        this.emit('error', error);
      }

      const _interval = this.getInterval(interval);

      await sleep(_interval * 0.9);

      try {
        await lock.unlock();
      } catch (error) {
        this.emit('error', error);
      }

      await sleep(_interval * 0.1);
    }
  }

  getInterval(interval: number | (() => number)): number {
    switch (typeof interval) {
      case 'number':
        return interval as number;

      case 'function':
        return (interval as Function)();

      default:
        throw new Error('interval is neither number nor function');
    }
  }
}
