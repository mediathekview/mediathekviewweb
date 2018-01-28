import { ExposedFunction, ExposedFunctionParameters, Exposer, ExposedFunctionResult } from './exposer';

type RegisteredExposedFunction = {
  path: string[],
  func: ExposedFunction
}

export interface ExposerMiddleware {
  handle: ExposerMiddlewareFunction;
}

export type ExposerMiddlewareNextFunction = (path: string[], parameters: ExposedFunctionParameters) => Promise<ExposedFunctionResult>;
export type ExposerMiddlewareFunction = (path: string[], parameters: ExposedFunctionParameters, next: ExposerMiddlewareNextFunction) => Promise<ExposedFunctionResult>;

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
      let next: ExposerMiddlewareNextFunction = this.getEndware(func);

      for (let i = this.middleware.length; i > 0; i--) {
        const middleware = this.middleware[i];

        next = (path, parameters) => middleware(path, parameters, next);
      }

      return next(path, parameters);
    };

    return wrappedFunction;
  }

  private getEndware(func: ExposedFunction): ExposerMiddlewareNextFunction {
    const endware: ExposerMiddlewareNextFunction = (path, parameters) => {
      return func(parameters);
    };

    return endware;
  }
}
