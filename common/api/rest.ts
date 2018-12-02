export type ResultResponse<T> = {
  result: T
};

export type ErrorResponse = {
  errors: ResultError[]
};

export type Response<T> = Partial<ResultResponse<T> | ErrorResponse>;

export type ResultError = {
  type: ErrorType,
  message?: string,
  details?: any
}

export enum ErrorType {
  UnknownRequest = 'UnknownRequest',
  InvalidRequest = 'InvalidRequest',
  Unauthorized = 'Unauthorized',
  NotFound = 'NotFound',
  ServerError = 'ServerError'
}

export function isResultResponse<T>(response: Response<T>): response is ResultResponse<T> {
  const hasResult = (response as ResultResponse<T>).result !== undefined;
  return hasResult;
}

export function isErrorResponse<T = any>(response: Response<T>): response is ErrorResponse {
  const hasError = (response as ErrorResponse).errors !== undefined;
  return hasError;
}

export function isResponse<T = any>(obj: any): obj is Response<T> {
  return (isResultResponse(obj) || isErrorResponse(obj));
}
