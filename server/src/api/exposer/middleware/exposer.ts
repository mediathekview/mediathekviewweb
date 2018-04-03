import { ExposedFunction, Exposer, Parameters } from '../';
import { Result } from '../../../common/api/rest';

type RegisteredExposedFunction<T> = {
  path: string[],
  func: ExposedFunction<T>
}

export interface ExposerMiddleware<T> {
  handle: ExposerMiddlewareFunction<T>;
}

export type ExposerMiddlewareNextFunction<T> = (path: string[], parameters: Parameters) => Promise<Result<T>>;
export type ExposerMiddlewareFunction<T> = (path: string[], parameters: Parameters, next: ExposerMiddlewareNextFunction<T>) => Promise<Result<T>>;

export class MiddlewareExposer implements Exposer {
  private readonly backingExposer: Exposer;
  private readonly middleware: ExposerMiddlewareFunction<any>[];

  constructor(backingExposer: Exposer) {
    this.backingExposer = backingExposer;
    this.middleware = [];
  }

  expose<T>(path: string[], func: ExposedFunction<T>): this {
    const wrappedFunction = this.getWrappedFunction(path, func);
    this.backingExposer.expose(path, wrappedFunction);

    return this;
  }

  registerMiddleware<T>(middleware: ExposerMiddleware<T> | ExposerMiddlewareFunction<T>): this {
    let middlewareFunction: ExposerMiddlewareFunction<T>;

    if (typeof middleware == 'function') {
      middlewareFunction = middleware;
    } else {
      middlewareFunction = middleware.handle.bind(middleware);
    }

    this.middleware.push(middlewareFunction);

    return this;
  }

  private getWrappedFunction<T>(path: string[], func: ExposedFunction<T>): ExposedFunction<T> {
    const wrappedFunction: ExposedFunction<T> = (parameters) => {
      let next: ExposerMiddlewareNextFunction<T> = this.getEndware(func);

      for (let i = this.middleware.length - 1; i >= 0; i--) {
        const middleware = this.middleware[i];
        const nextMiddleware = next;

        next = (path, parameters) => middleware(path, parameters, nextMiddleware);
      }

      return next(path, parameters);
    };

    return wrappedFunction;
  }

  private getEndware<T>(func: ExposedFunction<T>): ExposerMiddlewareNextFunction<T> {
    const endware: ExposerMiddlewareNextFunction<T> = (_path, parameters) => {
      return func(parameters);
    };

    return endware;
  }

  private wrapMiddleware<T>(middleware: ExposerMiddlewareFunction<T>, next: ExposerMiddlewareNextFunction<T>): ExposerMiddlewareNextFunction<T> {
    return (path, parameters) => middleware(path, parameters, next);
  }
}
