import { LockProvider } from '../common/lock';
import { DistributedLoop } from './distributed-loop';
import { Logger } from '../common/logger';

export class DistributedLoopProvider {
  private readonly lockProvider: LockProvider;
  private readonly logger: Logger;

  constructor(lockProvider: LockProvider, logger: Logger) {
    this.lockProvider = lockProvider;
    this.logger = logger;
  }

  get(key: string, throwError: boolean = true): DistributedLoop {
    return new DistributedLoop(key, this.lockProvider, this.logger, throwError);
  }
}
