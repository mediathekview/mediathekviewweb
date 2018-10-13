import { LoggerFactory, LogLevel } from './common/logger';
import { ConsoleLoggerFactory } from './common/logger/console';

export class LoggerFactoryProvider {
  private static loggerFactory: LoggerFactory | null = null;

  static get factory(): LoggerFactory {
    if (this.loggerFactory == null) {
      const paddedPid = process.pid.toString().padStart(5, '0');
      const globalPrefix = `[${paddedPid}]`;
      
      this.loggerFactory = new ConsoleLoggerFactory(LogLevel.Trace, globalPrefix);
    }

    return this.loggerFactory;
  }
}