import * as SocketIO from 'socket.io';
import * as HTTP from 'http';
import { SocketFunction, SocketResponseFunction, SocketError, SocketRequest, SocketResponse, errorToSocketError } from './common';

export class SocketIOCouplerServer {
  private io: SocketIO.Server;
  private functions: Map<string, SocketFunction> = new Map();

  constructor(httpServer: HTTP.Server, socketOptions: SocketIO.ServerOptions | null, private eventPrefix: string | null = null, private defaultBinding: object | null = null) {
    let options: SocketIO.ServerOptions | undefined = undefined;

    if (socketOptions != null) {
      options = socketOptions;
    }

    this.io = SocketIO(httpServer, options);

    this.initialize();
  }

  registerFunction(functionName: string, func: SocketFunction, binding?: object) {
    if (binding != undefined) {
      func = func.bind(binding);
    } else if (this.defaultBinding != null) {
      func = func.bind(this.defaultBinding);
    }

    this.functions.set(functionName, func);
  }

  async invoke<T>(functionName: string, ...parameters: any[]): Promise<T> {
    const event = this.eventPrefix + functionName;
    const request: SocketRequest = { parameters: parameters };

    return new Promise<T>((_resolve, reject) => {
      this.io.emit(event, request, (response: SocketResponse) => {
        if (response.error != undefined) {
          if (response.error.nonError != undefined) {
            return reject(response.error.nonError);
          } else {

          }
        }
      });
    });
  }

  private initialize() {
    this.io.on('connection', (socket) => this.handleSocket(socket));
  }

  private handleSocket(socket: SocketIO.Socket) {
    for (let socketFunction of this.functions) {
      const event = this.eventPrefix + socketFunction[0];
      const func = socketFunction[1];

      socket.on(event, async (request: SocketRequest, ack: SocketResponseFunction) => {
        const response = await this.handleRequest(func, request);
        ack(response);
      });
    }
  }

  private async handleRequest(func: SocketFunction, request: SocketRequest): Promise<SocketResponse> {
    let result;
    try {
      result = func(...request.parameters);

      while (result instanceof Promise) {
        result = await result;
      }
    }
    catch (error) {
      const socketError = errorToSocketError(error);
      return { error: socketError };
    }

    if (result instanceof Function) {
      result = (result as Function).toString();
      return { result: { functionBody: result } };
    } else {
      return { result: { obj: result } };
    }
  }
}
