export type ResultResponse<T> = {
  result: T
};

export type ErrorResponse = {
  error: ResultError
};

export type Response<T> = ResultResponse<T> | ErrorResponse;

export type ResultError = {
  message: string,
  details?: any
};

export function createResultResponse<T>(result: T): ResultResponse<T> {
  const response: ResultResponse<T> = {
    result
  };

  return response;
}

export function createErrorResponse(message: string, details?: any): ErrorResponse {
  const response: ErrorResponse = {
    error: {
      message,
      details
    }
  };

  return response;
}

export function isResultResponse<T = any>(response: Response<T> | unknown): response is ResultResponse<T> {
  const hasResult = (response as ResultResponse<T>).result != undefined;
  return hasResult;
}

export function isErrorResponse<T = any>(response: Response<T> | unknown): response is ErrorResponse {
  const hasError = (response as ErrorResponse).error != undefined;
  return hasError;
}

export function isResponse<T = any>(obj: unknown): obj is Response<T> {
  return (isResultResponse(obj) || isErrorResponse(obj));
}
