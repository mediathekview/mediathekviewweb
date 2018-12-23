import { Logger } from '../common/logger';

export class ElasticsearchLogAdapterFactory {
  static getLogAdapter(logger: Logger) {
    return class ElasticsearchLogAdapter {
      error(message: string) {
        logger.error(message);
      }

      warning(message: string) {
        logger.warn(message);
      }

      info(message: string) {
        logger.info(message);
      }

      debug(_message: string) {
        //ignore
      }

      trace(_method: any, _requestUrl: any, _body: any, _responseBody: any, _responseStatus: any) {
        //ignore
      }

      close() {
        logger.info('close');
      }
    }
  }
}
