import * as SocketIO from 'socket.io';
import * as HTTP from 'http';

import * as Model from '../model';

export class SocketIOServer {
    io: SocketIO.Server;
    httpServer: HTTP.Server;

    constructor(httpServer: HTTP.Server) {
        this.init();
    }

    init() {
        this.io = SocketIO(this.httpServer);

        this.io.on('connection', (socket: SocketIO.Socket) => {
            socket.on('query', (query: Model.Query, ack: (queryResponse: Model.QueryResponse) => void) => {
                this.query(query).then((response) => {
                    ack(response);
                }).catch((error) => {
                    ack(error);
                });
            });

            socket.on('getServerState', (ack: (response: Model.GetServerStateResponse) => void) => {

            });
        });
    }

    async query(request: Model.Query): Promise<Model.QueryResponse> {
        return new Promise<Model.QueryResponse>((resolve, reject) => {

        });
    }

    async getServerState(): Promise<Model.GetServerStateResponse> {
        return new Promise<Model.GetServerStateResponse>((resolve, reject) => {

        });
    }
}
