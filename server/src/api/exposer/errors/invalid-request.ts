import { ExposedFunctionError } from '../exposer';

export class InvalidRequestError implements ExposedFunctionError {
  type: 'InvalidRequest';
  message: string;
  details: any;

  constructor(message: string)
  constructor(message: string, details: any)
  constructor(message: string, details?: any) {
    this.message = message;
    this.details = details;
  }
}