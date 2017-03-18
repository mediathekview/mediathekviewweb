import { Injectable, isDevMode } from '@angular/core';

import * as SocketIO from 'socket.io-client';

import * as DataModel from './models/data-model';
import * as QueryModel from './models/query-model';
import * as APIModel from './models/api-model';

@Injectable()
export class MediathekViewWebAPIService implements APIModel.IMediathekViewWebAPI {
  private socket: SocketIOClient.Socket;

  constructor() {
    if (isDevMode()) {
      this.socket = SocketIO('localhost:8080');
    } else {
      this.socket = SocketIO();
    }
  }

  query(query: QueryModel.Query): Promise<APIModel.QueryResponse> {
    return new Promise((resolve, reject) => {

    });
  }

  getServerState(): Promise<APIModel.GetServerStateResponse> {
    return new Promise((resolve, reject) => {
      
    });
  }
}
