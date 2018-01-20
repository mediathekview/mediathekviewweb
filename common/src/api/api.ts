export type APIResponse<T> = { result?: T, error?: APIError };

export type APIError = { name?: string, message?: string, stack?: string };