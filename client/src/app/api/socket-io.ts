import * as SocketIO from 'socket.io-client';
import { MediathekViewWebAPI, Query, SearchEngineSearchResult } from '../common/api';
import { SocketResponse, APIError } from '../common/api/socket-io';
import { Entry } from '../common/model';

export class SocketIOMediathekViewWebAPI implements MediathekViewWebAPI {
  private io: SocketIOClient.Socket;

  constructor(opts?: SocketIOClient.ConnectOpts)
  constructor(uri: string, opts?: SocketIOClient.ConnectOpts)
  constructor(uriOrOpts?: string | SocketIOClient.ConnectOpts, opts?: SocketIOClient.ConnectOpts) {
    if (typeof uriOrOpts == 'string') {
      this.io = SocketIO(uriOrOpts, opts);
    } else {
      this.io = SocketIO(uriOrOpts);
    }
  }

  async search(query: Query): Promise<SearchEngineSearchResult<Entry>> {
    return this.emit<SearchEngineSearchResult<Entry>>('search', query);
  }

  async emit<T>(event: string, data: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.io.emit(event, data, (response: SocketResponse<T>) => {
        if (response.error != undefined) {
          return reject(response.error);
        }

        return resolve(response.result);
      });
    });
  }
}
