import { ErrorType, ResultError } from '../../../common/api/rest';

export class UnknownRequestError implements ResultError {
  type = ErrorType.UnknownRequest;
  message: string;
  details: any;

  constructor(message: string)
  constructor(message: string, details: any)
  constructor(message: string, details?: any) {
    this.message = message;
    this.details = details;
  }
}
