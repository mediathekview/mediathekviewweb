export class CustomError extends Error {
  constructor(message?: string) {
    const prototype = new.target.prototype;
    super(message);

    Object.setPrototypeOf(this, prototype);
  }
}
