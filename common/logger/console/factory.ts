import { LoggerFactory, LogLevel, Logger } from '../';
import { ConsoleLogger } from './logger';

export class ConsoleLoggerFactory implements LoggerFactory {
  private readonly level: LogLevel;
  private readonly globalPrefix: string;

  constructor(level: LogLevel, globalPrefix: string) {
    this.level = level;
    this.globalPrefix = globalPrefix;
  }

  create(prefix: string): Logger {
    return new ConsoleLogger(`${this.globalPrefix} ${prefix}`, this.level);
  }
}