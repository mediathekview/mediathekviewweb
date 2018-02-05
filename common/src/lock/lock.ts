import { Observable } from 'rxjs/Observable';

export type LockedFunction = () => Promise<void>;

export interface Lock {
  onLockLost: Observable<void>;

  acquire(): Promise<boolean>;
  acquire(timeout: number): Promise<boolean>;
  acquire(func: LockedFunction): Promise<boolean>;
  acquire(timeout: number, func: LockedFunction): Promise<boolean>;
  release(): Promise<boolean>;
  owned(): Promise<boolean>;
}
