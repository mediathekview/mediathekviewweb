export type ResultResponse<T> = {
  result: T
};

export type ErrorResponse = {
  error: ResultError
};

export type Response<T> = Partial<ResultResponse<T> | ErrorResponse>;

export type ResultError = {
  message: string,
  details?: any
};

export function createErrorResponse(message: string, details?: any): ErrorResponse {
  const response: ErrorResponse = {
    error: {
      message: message,
      details: details
    }
  };

  return response;
}

export function isResultResponse<T>(response: Response<T>): response is ResultResponse<T> {
  const hasResult = (response as ResultResponse<T>).result !== undefined;
  return hasResult;
}

export function isErrorResponse<T = any>(response: Response<T>): response is ErrorResponse {
  const hasError = (response as ErrorResponse).error !== undefined;
  return hasError;
}

export function isResponse<T = any>(obj: any): obj is Response<T> {
  return (isResultResponse(obj) || isErrorResponse(obj));
}
