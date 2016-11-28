class IPC extends EventEmitter {
    constructor(proc) {
        super();
        this.proc = proc;

        this.proc.on('message', (message) => {
            this.emit(message.type, message.body);
        });
    }

    send(type, body) {
        this.proc.send({
            type: type,
            body: body
        });
    }
}

module.exports = IPC;
