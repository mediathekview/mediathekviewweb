import { Result } from '../../common/api/rest';

export interface Exposer {
  expose(path: string[], func: ExposedFunction<any>): this;
}

export type ExposedFunction<T> = (parameters: Parameters) => Promise<Result<T>>;
export type Parameters = { [key: string]: any };

export const PATH_VALIDATION_REGEX = /^[a-zA-Z]+[a-zA-Z0-9]+$/;
