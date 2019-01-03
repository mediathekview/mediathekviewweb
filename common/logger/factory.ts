import { Logger } from './logger';

export interface LoggerFactory {
  create(prefix: string): Logger;
}
