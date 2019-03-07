import { LockProvider } from '../common/lock';
import { Logger } from '../common/logger';
import { DistributedLoop } from './distributed-loop';

export class DistributedLoopProvider {
  private readonly lockProvider: LockProvider;
  private readonly logger: Logger;

  constructor(lockProvider: LockProvider, logger: Logger) {
    this.lockProvider = lockProvider;
    this.logger = logger;
  }

  get(key: string): DistributedLoop {
    return new DistributedLoop(key, this.lockProvider, this.logger);
  }
}
