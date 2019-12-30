import { Logger } from '@tstdl/base/logger';
import { log, LoggerState } from 'mongodb';

export function getMongoLogAdapter(logger: Logger): log {
  const logFunction: log = (message?: string, state?: LoggerState) => {
    const debugLogMessage = JSON.stringify({ message, state }, undefined, 2);
    logger.debug(debugLogMessage);
  };

  return logFunction;
}
