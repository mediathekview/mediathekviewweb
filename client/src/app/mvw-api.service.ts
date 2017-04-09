import { Injectable } from '@angular/core';
import * as SocketIO from 'socket.io-client';

import { IMediathekViewWebAPI, IAPIResponse, QueryResponse, QueryInfo, GetServerStateResponse, Query } from './model';

@Injectable()
export class MVWAPIService implements IMediathekViewWebAPI {
  socket: SocketIOClient.Socket;

  constructor() {
    this.socket = SocketIO('37.209.7.7:7777');
  }

  query(query: Query): Promise<QueryResponse> {
    return this.emit<QueryResponse>('query', query);
  }

  getServerState(): Promise<GetServerStateResponse> {
    return this.emit<GetServerStateResponse>('getServerState');
  }

  private emit<T extends IAPIResponse>(event: string, data?: any): Promise<T> {
    return new Promise<T>((resolve, reject: (reason: Error) => void) => {
      this.socket.emit(event, data, (response: T) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });
  }
}
