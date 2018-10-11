import { Observable } from 'rxjs';

export type LockedFunction = () => void | Promise<void>;

export interface Lock {
  lockLost: Observable<void>;

  acquire(): Promise<boolean>;
  acquire(timeout: number): Promise<boolean>;
  acquire(func: LockedFunction): Promise<boolean>;
  acquire(timeout: number, func: LockedFunction): Promise<boolean>;

  release(): Promise<boolean>;
  release(forceReleaseGlobally: boolean): Promise<boolean>;

  owned(): Promise<boolean>;
}
