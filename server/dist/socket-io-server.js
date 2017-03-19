"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const SocketIO = require("socket.io");
class SocketIOServer {
    constructor(httpServer) {
        this.init();
    }
    init() {
        this.io = SocketIO(this.httpServer);
        this.io.on('connection', (socket) => {
            socket.on('query', (query, ack) => {
                this.query(query).then((response) => {
                    ack(response);
                }).catch((error) => {
                    ack(error);
                });
            });
            socket.on('getServerState', (ack) => {
            });
        });
    }
    query(request) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
            });
        });
    }
    getServerState() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
            });
        });
    }
}
exports.SocketIOServer = SocketIOServer;
//# sourceMappingURL=socket-io-server.js.map