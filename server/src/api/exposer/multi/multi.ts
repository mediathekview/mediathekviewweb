import { ExposedFunction, Exposer } from '../';

type RegisteredExposedFunction = {
  path: string[],
  func: ExposedFunction
}

export class MultiExposer implements Exposer {
  private readonly exposers: Set<Exposer>;
  private readonly functionRegistrations: Map<string, RegisteredExposedFunction>;

  constructor() {
    this.exposers = new Set();
    this.functionRegistrations = new Map();
  }

  registerExposer(exposer: Exposer): this {
    const alreadyRegistered = this.exposers.has(exposer);

    if (alreadyRegistered) {
      throw new Error('exposer already registered');
    }

    this.exposers.add(exposer);

    for (const { path, func } of this.functionRegistrations.values()) {
      exposer.expose(path, func);
    }

    return this;
  }

  expose(path: string[], func: ExposedFunction): this {
    const key = this.getKey(path);

    this.ensureKeyUniqueness(key);

    const registration = this.getRegistration(path, func);
    this.functionRegistrations.set(key, registration);

    for (const exposer of this.exposers) {
      exposer.expose(path, func);
    }

    return this;
  }

  private getKey(path: string[]): string {
    return path.join(';');
  }

  private ensureKeyUniqueness(key: string): void | never {
    if (this.functionRegistrations.has(key)) {
      throw new Error('path already has function exposed');
    }
  }

  private getRegistration(path: string[], func: ExposedFunction): RegisteredExposedFunction {
    const registration: RegisteredExposedFunction = {
      path: path,
      func: func
    }

    return registration;
  }
}
