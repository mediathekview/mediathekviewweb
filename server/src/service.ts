import { AsyncDisposable } from './common/disposable';

export const MicroServiceName = Symbol('ServiceName');

export interface Service extends AsyncDisposable {
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface MicroService extends Service {
  readonly [MicroServiceName]: string;
}
