export interface Service {
  readonly serviceName: string;

  initialize(): Promise<void>;
  run(): Promise<void>;
  stop(): Promise<void>;
}
