export type LogEntry = string;

export interface Logger {
  error(entry: LogEntry): void;
  warn(entry: LogEntry): void;
  info(entry: LogEntry): void;
  verbose(entry: LogEntry): void;
  debug(entry: LogEntry): void;
  silly(entry: LogEntry): void;
}