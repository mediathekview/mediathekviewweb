import * as SocketIO from 'socket.io';
import { Nullable } from '../../utils';
import { MediathekViewWebAPI, Query, SearchEngineSearchResult, IEntry } from '../api';

type ErrorType = { name?: string, message?: string, stack?: string };
type SocketResponseType<T> = { result?: T, error?: ErrorType };
type Acknowledgement<T> = (response: SocketResponseType<T>) => void;

export class SocketIOExposer {
  constructor(private api: MediathekViewWebAPI, private io: SocketIO.Server, private eventPrefix: string = '') {
  }

  private initialize() {
    this.io.on('connection', (socket) => this.handleSocket(socket));
  }

  private handleSocket(socket: SocketIO.Socket) {
    const event = (event: string) => { return this.eventPrefix + event };

    socket.on(event(this.api.search.name), async (query: Query, ack: Acknowledgement<SearchEngineSearchResult<IEntry>>) => {
      try {
        const result = await this.api.search(query);
        ack(this.socketResult(result));
      }
      catch (error) {
        ack(this.socketError(error));
        throw error;
      }
    });
  }

  private socketResult<T>(result: T): { result: T } {
    return { result: result };
  }

  private socketError<T>(error): { error: ErrorType } {
    if (typeof error == 'string') {
      return { error: { message: error } };
    }
    else if (error instanceof Error) {
      return { error: { name: error.name, message: error.message, stack: error.stack } };
    }

    throw new Error(`no handler for error of type ${typeof error} available: ${error}`);
  }
}
