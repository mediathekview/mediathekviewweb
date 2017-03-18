"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SocketIO = require("socket.io");
class SocketIOServer {
    constructor() {
    }
    start(httpServer) {
        this.io = SocketIO(httpServer);
    }
}
exports.SocketIOServer = SocketIOServer;
//# sourceMappingURL=socket-io-server.js.map