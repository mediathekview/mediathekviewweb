import { Logger } from '@common-ts/base/logger';

interface ElasticsearchLogAdapter {
  error(message: string): void;
  warning(message: string): void;
  info(message: string): void;
  debug(message: string): void;
  close(): void;
}

export function getElasticsearchLogAdapter(logger: Logger): ElasticsearchLogAdapter {
  return {
    error: (message: string) => logger.error(message),
    warning: (message: string) => logger.warn(message),
    info: (message: string) => logger.info(message),
    debug: (message: string) => logger.debug(message),
    close: () => { /* no need of close */ }
  };
}
