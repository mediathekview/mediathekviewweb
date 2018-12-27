export interface LoopController {
  stop: () => Promise<void>;
  stopped: Promise<void>;
  error: Error | null;
  setTiming: (timing: { interval: number, accuracy: number }) => void;
}
