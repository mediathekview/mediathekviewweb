export type Result<T> = {
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
