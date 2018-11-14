export class MultiError extends Error {
  readonly errors: Error[];

  constructor(errors: Error[], message?: string) {
    const prototype = new.target.prototype;
    super(message);

    Object.setPrototypeOf(this, prototype);

    this.errors = errors;
  }
}
