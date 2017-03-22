import { EventEmitter } from 'events';

export interface State {
    step: string;
    info?: Object;
}

export class StateEmitter extends EventEmitter {
    state: State;

    constructor() {
        super();
    }

    updateState(infoOrProperty: Object | string, value?: any) {
        if (typeof infoOrProperty == 'string' && value != undefined) {
            this.state.info[infoOrProperty] = value;
        } else if (typeof infoOrProperty == 'object') {
            for (var property in infoOrProperty) {
                this.state.info[property] = infoOrProperty[property];
            }
        }

        this.emitState();
    }

    setState(step: string, info?: Object) {
        this.state = { step: step, info: info };

        this.emitState();
    }

    emitState() {
        this.emit('state', this.state);
    }
}
