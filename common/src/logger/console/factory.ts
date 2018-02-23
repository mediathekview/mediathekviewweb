import { LoggerFactory, LogLevel, Logger } from '../';
import { ConsoleLogger } from './logger';

export class ConsoleLoggerFactory implements LoggerFactory {
  private readonly level: LogLevel;

  constructor(level: LogLevel) {
    this.level = level;
  }

  create(prefix: string): Logger {
    return new ConsoleLogger(prefix, this.level);
  }
}