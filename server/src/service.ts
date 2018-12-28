import { AsyncDisposable } from './common/disposable';

export interface Service extends AsyncDisposable {
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface MicroService extends Service {
  readonly name: string;
}
