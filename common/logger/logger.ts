export type LogEntry = string;

export interface Logger {
  error(error: Error): void;
  error(error: Error, includeStack: boolean): void;
  error(entry: LogEntry): void;
  warn(entry: LogEntry): void;
  info(entry: LogEntry): void;
  verbose(entry: LogEntry): void;
  debug(entry: LogEntry): void;
  trace(entry: LogEntry): void;
}