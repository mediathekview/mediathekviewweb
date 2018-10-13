import { log, LoggerState } from 'mongodb';
import { Logger } from '../common/logger';

export class MongoLogAdapterFactory {
  static getLogFunction(logger: Logger) {
    const logFunction: log = (message?: string, state?: LoggerState) => {
      const debugLogMessage = JSON.stringify({
        message,
        state
      }, null, 2);

      logger.debug(debugLogMessage);
    };

    return logFunction;
  }
}