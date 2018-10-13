import { Logger, LogLevel, LogEntry } from '../';
import { formatError } from '../../utils';

export class ConsoleLogger implements Logger {
  private readonly prefix: string;
  private readonly level: LogLevel;

  constructor(prefix: string, level: LogLevel) {
    this.prefix = prefix;
    this.level = level;
  }

  error(error: Error): void;
  error(error: Error, includeStack: boolean): void;
  error(entry: LogEntry): void;
  error(errorOrEntry: Error | LogEntry, includeStack: boolean = true): void {
    let entry: LogEntry;

    if (errorOrEntry instanceof Error) {
      entry = formatError(errorOrEntry, includeStack);
    } else {
      entry = errorOrEntry;
    }

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

  private log(func: (...parameters: any[]) => void, entry: LogEntry, level: LogLevel) {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    if (this.level >= level) {
      func(`${timeString} - ${this.prefix}`, entry);
    }
  }
}