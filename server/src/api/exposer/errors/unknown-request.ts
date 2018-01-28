import { ExposedFunctionError } from '../exposer';

export class UnknownRequestError implements ExposedFunctionError {
  type: 'UnknownRequest';
  message: string;
  details: any;

  constructor(message: string)
  constructor(message: string, details: any)
  constructor(message: string, details?: any) {
    this.message = message;
    this.details = details;
  }
}
