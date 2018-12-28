export interface LoopController {
  stop: () => Promise<void>;
  stopped: Promise<void>;
  error: Error | null;
}
