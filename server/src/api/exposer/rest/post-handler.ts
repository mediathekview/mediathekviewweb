import { RestResponse, RestError } from './definitions';
import '../../../common/extensions/set';

export class ParametersRestError implements RestError {
  type: string;
  message: string;

  constructor(type: string, parameters: Iterable<string>) {
    const parametersArray = Array.from(parameters);

    this.type = type;
    this.message = parametersArray.join(', ');
  }
}

export class RestPostHandler {
  private readonly requiredParameters: Set<string>;
  private readonly optionalParameters: Set<string>;

  constructor(requiredParameters: string[], optionalParameters: string[]) {
    this.requiredParameters = new Set(requiredParameters);
    this.optionalParameters = new Set(optionalParameters);
  }

  async handler(parameters: { [key: string]: any }): Promise<RestResponse> {
    const parametersErrors = this.verifyParameters(parameters);

    if (parametersErrors != null) {
      return { errors: parametersErrors };
    }

    const result = 5;

    return { result: result };
  }

  private verifyParameters(parameters: { [key: string]: any }): RestError[] | null {
    const parameterNames = Object.getOwnPropertyNames(parameters);
    const parameterSet = new Set(parameterNames);

    const missingParameters = this.requiredParameters.difference(parameterSet);
    const unknownParameters = parameterSet.difference(this.requiredParameters, this.optionalParameters);

    const errors: RestError[] = [];

    if (missingParameters.size > 0) {
      const missingParametersError = new ParametersRestError('missing-parameters', missingParameters);
      errors.push(missingParametersError);
    }

    if (unknownParameters.size > 0) {
      const unknownParametersError = new ParametersRestError('unknown-parameters', missingParameters);
      errors.push(unknownParametersError);
    }

    if (errors.length > 0) {
      return errors;
    }

    return null;
  }
}