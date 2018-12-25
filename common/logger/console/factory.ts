import { LoggerFactory } from '../factory';
import { LogLevel } from '../level';
import { Logger } from '../logger';
import { ConsoleLogger } from './logger';

export class ConsoleLoggerFactory implements LoggerFactory {
  private readonly level: LogLevel;
  private readonly globalPrefix?: string;

  constructor(level: LogLevel, globalPrefix?: string) {
    this.level = level;
    this.globalPrefix = globalPrefix;
  }

  create(prefix: string): Logger {
    const loggerPrefix = this.globalPrefix != undefined ? `${this.globalPrefix} ${prefix}` : prefix;
    return new ConsoleLogger(loggerPrefix, this.level);
  }
}
