import { log, LoggerState } from 'mongodb';
import { Logger } from '../common/logger';

export function getMongoLogAdapter(logger: Logger): log {
  const logFunction: log = (message?: string, state?: LoggerState) => {
    const debugLogMessage = JSON.stringify({ message, state }, undefined, 2);
    logger.debug(debugLogMessage);
  };

  return logFunction;
}
