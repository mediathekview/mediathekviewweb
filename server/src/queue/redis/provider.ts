import { LoggerFactory } from '../../common/logger';
import { QueueProvider } from '../provider';
import { Queue } from '../queue';
import { RedisJobId } from './queue';

export class RedisQueueProvider implements QueueProvider<RedisJobId> {
  private readonly loggerFactory: LoggerFactory;
  private readonly loggerPrefix: string;

  constructor(loggerFactory: LoggerFactory, loggerPrefix: string) {
    this.loggerFactory = loggerFactory;
    this.loggerPrefix = loggerPrefix;
  }

  get<DataType>(key: string): Queue<DataType, RedisJobId> {
    throw new Error("Method not implemented.");
  }
}
