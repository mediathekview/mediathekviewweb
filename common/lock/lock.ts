import { Observable } from 'rxjs';

export type LockedFunction = () => any | Promise<any>;

export interface Lock {
  readonly owned: boolean;
  readonly lockLost: Observable<void>;

  acquire(): Promise<boolean>;
  acquire(timeout: number): Promise<boolean>;
  acquire(func: LockedFunction): Promise<boolean>;
  acquire(timeout: number, func: LockedFunction): Promise<boolean>;

  release(): Promise<boolean>;
  release(force: boolean): Promise<boolean>;

  exists(): Promise<boolean>;

  forceUpdateOwned(): Promise<void>;
}
