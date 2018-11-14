export type Response<T> = {
  result?: T,
  errors?: ResultError[]
}

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

export function isResponse<T = any>(obj: any): obj is Response<T> {
  const hasResult = (obj as Response<T>).result !== undefined;

  if (hasResult) {
    return true;
  }

  const hasErrors = Array.isArray((obj as Response<T>).errors);

  if (hasErrors) {
    return true;
  }

  return false;
}
