import * as SocketIO from 'socket.io';
import * as HTTP from 'http';

import * as Model from './model';

export class SocketIOServer {
    io: SocketIO.Server;

    constructor() {
      
    }

    start(httpServer: HTTP.Server): void {
        this.io = SocketIO(httpServer);
    }
}
