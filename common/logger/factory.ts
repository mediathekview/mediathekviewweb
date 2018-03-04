import { Logger } from './logger';
import { LogLevel } from './level';

export interface LoggerFactory {
  create(prefix: string): Logger;
}