import { CustomError } from './custom-error';

export class MultiError extends CustomError {
  readonly errors: Error[];

  constructor(errors: Error[], message?: string) {
    super(message);

    this.errors = errors;
  }
}
