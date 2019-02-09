/* tslint:disable: no-console no-unbound-method */

import { formatError } from '../../utils';
import { LogLevel } from '../level';
import { LogEntry, Logger } from '../logger';

export class ConsoleLogger implements Logger {
  private readonly level: LogLevel;
  private readonly logPrefix: string;

  constructor(level: LogLevel, prefix?: string) {
    this.level = level;
    this.logPrefix = (prefix != undefined) ? prefix : '';
  }

  prefix(prefix: string): Logger {
    return new ConsoleLogger(this.level, this.logPrefix + prefix);
  }

  error(entry: LogEntry): void;
  error(error: Error, includeStack?: boolean): void;
  error(errorOrEntry: Error | LogEntry, includeStack: boolean = true): void {
    const entry = (errorOrEntry instanceof Error)
      ? formatError(errorOrEntry, includeStack)
      : errorOrEntry;

    this.log(console.error, entry, LogLevel.Error);
  }

  warn(entry: LogEntry): void {
    this.log(console.warn, entry, LogLevel.Warn);
  }

  info(entry: LogEntry): void {
    this.log(console.info, entry, LogLevel.Info);
  }

  verbose(entry: LogEntry): void {
    this.log(console.info, entry, LogLevel.Verbose);
  }

  debug(entry: LogEntry): void {
    this.log(console.debug, entry, LogLevel.Debug);
  }

  trace(entry: LogEntry): void {
    this.log(console.debug, entry, LogLevel.Trace);
  }

  private log(func: (...parameters: any[]) => void, entry: LogEntry, level: LogLevel): void {
    if (this.level < level) {
      return;
    }

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;

    func(`${timeString} - ${this.logPrefix}${entry}`);
  }
}
