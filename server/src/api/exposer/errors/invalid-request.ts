import { ErrorType, ResultError } from '../exposer';

export class InvalidRequestError implements ResultError {
  type = ErrorType.InvalidRequest;
  message: string;
  details: any;

  constructor(message: string)
  constructor(message: string, details: any)
  constructor(message: string, details?: any) {
    this.message = message;
    this.details = details;
  }
}
