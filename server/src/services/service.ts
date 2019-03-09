import { Observable } from 'rxjs';

export type ServiceMetric = {
  name: string;
  values: Observable<number>;
};

export enum ServiceState {
  Running,
  Stopping,
  Stopped,
  Erroneous
}

export interface Service {
  metrics: ReadonlyArray<ServiceMetric>;
  start(): Promise<void>;
  stop(): Promise<void>;
}
