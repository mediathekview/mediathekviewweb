import { Observable } from 'rxjs';

export enum ServiceMetricType {
  Counter,
  Gauge
}

export type ServiceMetricValue = {
  value: number,
  labels: string[]
}

export type ServiceMetric = {
  name: string,
  type: ServiceMetricType,
  values: Observable<ServiceMetricValue>
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
