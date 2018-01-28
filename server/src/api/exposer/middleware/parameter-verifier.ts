import { ExposerMiddleware, ExposerMiddlewareFunction, ExposerMiddlewareNextFunction } from "../middleware-exposer";
import { ExposedFunctionResult, ExposedFunctionParameters } from "../exposer";

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
      verification = this.getVerification(key);
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
