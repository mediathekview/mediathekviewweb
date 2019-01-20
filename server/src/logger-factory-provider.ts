import { LoggerFactory, LogLevel } from './common/logger';
import { ConsoleLoggerFactory } from './common/logger/console';

export class LoggerFactoryProvider {
  private static loggerFactory?: LoggerFactory;

  static get factory(): LoggerFactory {
    if (this.loggerFactory == undefined) {
      this.loggerFactory = new ConsoleLoggerFactory(LogLevel.Trace);
    }

    return this.loggerFactory;
  }
}
