export interface LoopController {
  stopped: Promise<void>;
  error: Error | undefined;

  stop(): Promise<void>;
}
