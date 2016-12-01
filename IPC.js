const EventEmitter = require('events');

class IPC extends EventEmitter {
    constructor(proc) {
        super();
        this.proc = proc;

        this.proc.on('message', (message) => {
            this.emit(message.type, message.data);
        });
    }

    send(type, data) {
        this.proc.send({
            type: type,
            data: data
        });
    }
}

module.exports = IPC;
