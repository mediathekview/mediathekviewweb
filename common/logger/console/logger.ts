import { Logger, LogLevel, LogEntry } from '../';

export class ConsoleLogger implements Logger {
  private readonly prefix: string;
  private readonly level: LogLevel;

  constructor(prefix: string, level: LogLevel) {
    this.prefix = prefix;
    this.level = level;
  }

  error(entry: LogEntry): void {
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

  silly(entry: LogEntry): void {
    this.log(console.debug, entry, LogLevel.Silly);
  }

  private log(func: (...parameters: any[]) => void, entry: LogEntry, level: LogLevel) {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    if (this.level >= level) {
      func(`${timeString} - ${this.prefix}`, entry);
    }
  }
}