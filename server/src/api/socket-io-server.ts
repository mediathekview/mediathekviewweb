import * as SocketIO from 'socket.io';
import * as HTTP from 'http';

import * as Model from '../model';
import { MVWAPI } from './mvw-api';

export class SocketIOServer {
    io: SocketIO.Server;

    constructor(private httpServer: HTTP.Server, private mvwAPI: MVWAPI) {
        this.init();
    }

    init() {
        this.io = SocketIO(this.httpServer);

        this.io.on('connection', (socket: SocketIO.Socket) => {
            socket.on('query', async (query: Model.Query, ack: (queryResponse: Model.QueryResponse) => void) => {
                try {
                    let response = await this.mvwAPI.query(query);
                    ack(response);
                } catch (error) {
                    ack(error)
                };
            });

            socket.on('getServerState', async (ack: (response: Model.GetServerStateResponse) => void) => {
                try {
                    let response = await this.mvwAPI.getServerState();
                    ack(response);
                } catch (error) {
                    ack(error);
                }
            });
        });
    }
}
