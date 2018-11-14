import '../../../common/extensions/set';
import { Response, ResultError } from '../../../common/api/rest';
import { SyncEnumerable } from '../../../common/enumerable';
import { InvalidRequestError } from '../errors/invalid-request';
import { Parameters } from '../exposer';
import { ExposerMiddleware, ExposerMiddlewareNextFunction } from './exposer';

type Verification = {
  required: Set<string>;
  optional: Set<string>;
}

export class ParameterVerifierExposerMiddleware<T> implements ExposerMiddleware<T> {
  private readonly verifications: Map<string, Verification>;

  constructor() {
    this.verifications = new Map();
  }

  addRequired(path: string[], ...parameters: string[]): this {
    const verification = this.getVerification(path);

    for (const parameter of parameters) {
      verification.required.add(parameter);
    }

    return this;
  }

  addOptional(path: string[], ...parameters: string[]): this {
    const verification = this.getVerification(path);

    for (const parameter of parameters) {
      verification.optional.add(parameter);
    }

    return this;
  }

  async handle(path: string[], parameters: Parameters, next: ExposerMiddlewareNextFunction<T>): Promise<Response<T>> {
    const verification = this.getVerification(path);

    const propertyNames = Object.getOwnPropertyNames(parameters);
    const properties = new Set(propertyNames);

    const missingProperties = verification.required.difference(properties);
    const unknownProperties = properties.difference(verification.required, verification.optional);

    const errors: ResultError[] = [];

    if (missingProperties.size > 0) {
      const missingPropertiesArray = SyncEnumerable.from(missingProperties).toArray();
      const error = new InvalidRequestError('request is missing parameters', missingPropertiesArray);
      errors.push(error);
    }

    if (unknownProperties.size > 0) {
      const unknownPropertiesArray = SyncEnumerable.from(unknownProperties).toArray();
      const error = new InvalidRequestError('request has unknown parameters', unknownPropertiesArray);
      errors.push(error);
    }

    if (errors.length > 0) {
      return { errors: errors };
    }

    return next(path, parameters);
  }

  private getVerification(key: string): Verification;
  private getVerification(path: string[]): Verification;
  private getVerification(keyOrPath: string | string[]): Verification {
    let key: string;

    if (Array.isArray(keyOrPath)) {
      key = this.getKey(keyOrPath);
    } else {
      key = keyOrPath;
    }

    const has = this.verifications.has(key);

    let verification: Verification;
    if (!has) {
      verification = this.createVerification(key);
    } else {
      verification = this.verifications.get(key) as Verification;
    }

    return verification;
  }

  private createVerification(key: string): Verification {
    const verification: Verification = {
      required: new Set(),
      optional: new Set()
    }

    this.verifications.set(key, verification);

    return verification;
  }

  private getKey(path: string[]): string {
    return path.join(';');
  }
}
