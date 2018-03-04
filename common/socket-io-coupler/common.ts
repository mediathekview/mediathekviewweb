export type SocketFunction = (...parameters: any[]) => Promise<any> | any;
export type SocketResponseFunction = (response: SocketResponse) => void;

export type SocketError = { name?: string, message?: string, stack?: string, nonError?: any };

export type SocketRequest = { parameters: any[] };
export type SocketResponse = { result?: { obj?: object, functionBody?: string }, error?: SocketError };

export function errorToSocketError(error: any): SocketError {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  } else {
    const stack = (new Error()).stack;
    return { nonError: error, stack: stack };
  }
}
