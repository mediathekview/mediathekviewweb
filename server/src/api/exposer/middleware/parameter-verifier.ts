import { ExposerMiddleware, ExposerMiddlewareFunction, ExposerMiddlewareNextFunction } from './exposer';
import { ExposedFunctionResult, ExposedFunctionParameters, ExposedFunctionError, ExposedFunction } from '../exposer';
import { InvalidRequestError } from '../errors/invalid-request';
import { SyncEnumerable } from '../../../common/enumerable';
import '../../../common/extensions/set';

type Verification = {
  required: Set<string>;
  optional: Set<string>;
}

export class ParameterVerifierExposerMiddleware implements ExposerMiddleware {
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

  async handle(path: string[], parameters: ExposedFunctionParameters, next: ExposerMiddlewareNextFunction): Promise<ExposedFunctionResult> {
    const verification = this.getVerification(path);

    const propertyNames = Object.getOwnPropertyNames(parameters);
    const properties = new Set(propertyNames);

    const missingProperties = verification.required.difference(properties);
    const unknownProperties = properties.difference(verification.required, verification.optional);

    const errors: ExposedFunctionError[] = [];

    if (missingProperties.size > 0) {
      const missingPropertiesArray = SyncEnumerable.toArray(missingProperties);
      const error = new InvalidRequestError('request is missing parameters', missingPropertiesArray);
      errors.push(error);
    }

    if (unknownProperties.size > 0) {
      const unknownPropertiesArray = SyncEnumerable.toArray(unknownProperties);
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
