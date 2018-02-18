export interface Exposer {
  expose(path: string[], func: ExposedFunction): this;
}

export type ExposedFunction = (parameters: Parameters) => Promise<Result>;
export type Parameters = { [key: string]: any };
export type Result = { result?: any, errors?: ResultError[] };
export type ResultError = { type: ErrorType, message?: string, details?: any };

export enum ErrorType {
  UnknownRequest = 'UnknownRequest',
  InvalidRequest = 'InvalidRequest',
  Unauthorized = 'Unauthorized',
  NotFound = 'NotFound',
  ServerError = 'ServerError'
};

export const PATH_VALIDATION_REGEX = /^[a-zA-Z]+[a-zA-Z0-9]+$/;
