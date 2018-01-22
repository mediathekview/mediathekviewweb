import { ExposerMiddleware, ExposerMiddlewareFunction } from "../middleware-exposer";
import { ExposedFunctionResult, ExposedFunctionParameters } from "../exposer";

type Verification = {
  required: Set<string> | null;
  optional: Set<string> | null;
}

export class ParameterVerifierExposerMiddleware implements ExposerMiddleware {
  private readonly verifications: Map<string, Verification>;

  constructor() {
    this.verifications = new Map();
  }

  addOptional(path: string[], ...parameters: string[]): this {

    return this;
  }

  async handle(path: string[], parameters: ExposedFunctionParameters, next: ExposerMiddlewareFunction): Promise<ExposedFunctionResult> {

  }

  private hasVerification(path: string[]): boolean {

  }

  private getSet() {

  }

  private getKey(path: string[]): string {
    return path.join(';');
  }
}