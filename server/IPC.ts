import EventEmitter from 'node:events';

export class IPC extends EventEmitter {
  process: any;

  constructor(process) {
    super();
    this.process = process;

    this.process.on('message', (message) => {
      this.emit(message.type, message.data);
    });
  }

  send(type: string, data?: any) {
    if (typeof this.process.send === 'function') {
      this.process.send({
        type: type,
        data: data
      });
    }
  }
}
