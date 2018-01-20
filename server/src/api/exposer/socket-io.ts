import * as SocketIO from 'socket.io';
import * as HTTP from 'http';
import { Nullable } from '../../common/utils';
import { SearchQuery, SearchResult, Entry } from '../api';
import { SearchApi, APIError, APIResponse } from '../../common/api';

type Acknowledgement<T> = (response: APIResponse<T>) => void;

export class SocketIOMediathekViewWebAPIExposer {
  private io: SocketIO.Server;

  constructor(private api: SearchApi, private httpServer: HTTP.Server, private path: string = '/socket.io', private eventPrefix: string = '') {
    this.io = SocketIO(httpServer, { path: path });

    this.initialize();
  }

  private initialize() {
    this.io.on('connection', (socket) => this.handleSocket(socket));
  }

  private handleSocket(socket: SocketIO.Socket) {
    const event = (event: string) => { return this.eventPrefix + event };

    socket.on(event(this.api.search.name), async (query: SearchQuery, ack: Acknowledgement<SearchResult<Entry>>) => {
      console.log(query);
      try {
        const result = await this.api.search(query);
        ack(this.socketResult(result));
      }
      catch (error) {
        ack(this.socketError(error));
        console.error(error);
      }
    });
  }

  private socketResult<T>(result: T): { result: T } {
    return { result: result };
  }

  private socketError<T>(error): { error: APIError } {
    if (typeof error == 'string') {
      return { error: { message: error } };
    }
    else if (error instanceof Error) {
      return { error: { name: error.name, message: error.message, stack: error.stack } };
    }

    const noHandlerAvailableError = new Error(`no handler for error of type ${typeof error} available: ${error}`);
    console.error(noHandlerAvailableError);

    return this.socketError(noHandlerAvailableError);
  }
}
