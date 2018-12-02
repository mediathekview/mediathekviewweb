import { Response } from '../../common/api/rest';

export interface Exposer {
  expose(path: string[], func: ExposedFunction<any>): this;
}

export type ExposedFunctionParameters = StringMap;
export type ExposedFunction<T> = (parameters: ExposedFunctionParameters) => Promise<Response<T>>;

export const PATH_VALIDATION_REGEX = /^[a-zA-Z]+[a-zA-Z0-9]+$/;
