import { Observable } from "rxjs/Observable";

export interface LoopController {
  stop: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  setTiming: (timing: { interval: number, accuracy: number }) => void;
  error: Observable<any>;
}
