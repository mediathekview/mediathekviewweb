import { ExposedFunctionError } from '../exposer';

export class UnknownRequestError implements ExposedFunctionError {
  type: 'UnknownRequest';
  message?: string;

  constructor()
  constructor(message?: string)
  constructor(message?: string) {
    this.message = message;
  }
}