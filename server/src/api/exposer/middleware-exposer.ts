import { SyncEnumerable } from '../../common/enumerable/index';
import { ExposedFunction, ExposedFunctionParameters, Exposer, ExposedFunctionResult } from './exposer';

type RegisteredExposedFunction = {
  path: string[],
  func: ExposedFunction
}

export interface ExposerMiddleware {
  handle: ExposerMiddlewareFunction;
}

export type ExposerMiddlewareFunction = (path: string[], parameters: ExposedFunctionParameters, next: ExposerMiddlewareFunction) => Promise<ExposedFunctionResult>;

export class MiddlewareExposer implements Exposer {
  private readonly backingExposer: Exposer;
  private readonly middleware: ExposerMiddlewareFunction[];

  constructor(backingExposer: Exposer) {
    this.backingExposer = backingExposer;
  }

  expose(path: string[], func: ExposedFunction): this {
    const wrappedFunction = this.getWrappedFunction(path, func);
    this.backingExposer.expose(path, wrappedFunction);

    return this;
  }

  registerMiddleware(middleware: ExposerMiddleware | ExposerMiddlewareFunction): this {
    let middlewareFunction: ExposerMiddlewareFunction;

    if (typeof middleware == 'function') {
      middlewareFunction = middleware;
    } else {
      middlewareFunction = (path, parameters, next) => middleware.handle(path, parameters, next);
    }

    this.middleware.push(middlewareFunction);

    return this;
  }

  private getWrappedFunction(path: string[], func: ExposedFunction): ExposedFunction {
    const wrappedFunction: ExposedFunction = (parameters) => {
      let next: ExposerMiddlewareFunction = this.getEndware(func);

      for (const middleware of this.middleware) {
        next = (path, parameters, next) => middleware(path, parameters, next);
      }

      return next(path, parameters, next);
    };

    return wrappedFunction;
  }

  private getEndware(func: ExposedFunction): ExposerMiddlewareFunction {
    const endware: ExposerMiddlewareFunction = (path, parameters, next) => {
      return func(parameters);
    };

    return endware;
  }
}
