export type APIError = { name?: string, message?: string, stack?: string };
export type SocketResponse<T> = { result?: T, error?: APIError };
