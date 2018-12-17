import { Service } from './service';

export enum ServiceState {
  Uninitialized,
  Initializing,
  Initialized,
  Running,
  Finished,
  Stopping,
  Stopped,
  Erroneous
}

export abstract class ServiceBase implements Service {
  private state: ServiceState;

  protected stopRequested: boolean;

  abstract serviceName: string;

  protected abstract _initialize(): Promise<void>;
  protected abstract _run(): Promise<void>;
  protected abstract _stop(): Promise<void>;

  async initialize(): Promise<void> {
    if (this.state != ServiceState.Uninitialized) {
      throw new Error(`service is ${ServiceState[this.state].toLowerCase()}`);
    }

    try {
      this.state = ServiceState.Initializing;
      await this._initialize();
      this.state = ServiceState.Initializing;
    }
    catch (error) {
      this.state = ServiceState.Erroneous;
      throw error;
    }
  }

  async run(): Promise<void> {
    if (this.state != ServiceState.Initialized) {
      throw new Error(`service is ${ServiceState[this.state].toLowerCase()}`);
    }

    try {
      this.state = ServiceState.Running;
      await this._run();
      this.state = ServiceState.Finished;
    }
    catch (error) {
      this.state = ServiceState.Erroneous;
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.state != ServiceState.Running) {
      throw new Error(`service is not running, but ${ServiceState[this.state].toLowerCase()}`);
    }

    try {
      this.stopRequested = true;
      this.state = ServiceState.Stopping;
      await this._stop();
      this.state = ServiceState.Stopped;
    }
    catch (error) {
      this.state = ServiceState.Erroneous;
      throw error;
    }
  }
}
