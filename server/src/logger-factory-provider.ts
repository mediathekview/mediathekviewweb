import { LoggerFactory, LogLevel } from './common/logger';
import { ConsoleLoggerFactory } from './common/logger/console';

export class LoggerFactoryProvider {
  private static loggerFactory: LoggerFactory | null = null;

  static get factory(): LoggerFactory {
    if (this.loggerFactory == null) {
      this.loggerFactory = new ConsoleLoggerFactory(LogLevel.Silly);
    }

    return this.loggerFactory;
  }
}