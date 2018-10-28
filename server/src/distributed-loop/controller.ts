import { Observable } from 'rxjs';

export interface LoopController {
  stop: () => Promise<void>;
  setTiming: (timing: { interval: number, accuracy: number }) => void;
  error: Observable<any>;
}
