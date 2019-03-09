import { CancellationToken } from '../common/utils/cancellation-token';
import { Service, ServiceMetric, ServiceState } from './service';

export abstract class ServiceBase implements Service {
  private readonly _cancellationToken: CancellationToken;

  private runPromise: Promise<void>;
  private state: ServiceState;

  abstract metrics: ServiceMetric[];

  protected get cancellationToken(): CancellationToken {
    return this._cancellationToken;
  }

  private get stateString(): string {
    return ServiceState[this.state].toLowerCase();
  }

  constructor() {
    this.runPromise = Promise.resolve();
    this.state = ServiceState.Stopped;
    this._cancellationToken = new CancellationToken();
  }

  async start(): Promise<void> {
    if (this.state != ServiceState.Stopped) {
      throw new Error(`cannot start service, it is ${this.stateString}`);
    }

    this.cancellationToken.reset();

    try {
      this.state = ServiceState.Running;
      this.runPromise = this.run(this._cancellationToken);
      await this.runPromise;
      this.state = ServiceState.Stopped;
    }
    catch (error) {
      this.state = ServiceState.Erroneous;
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.state != ServiceState.Running) {
      throw new Error(`cannot stop service, it is ${this.stateString}`);
    }

    this.cancellationToken.set();
    await this.runPromise;
  }

  protected abstract run(cancellationToken: CancellationToken): Promise<void>;
}
