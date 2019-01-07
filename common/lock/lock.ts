export type LockedFunction = (controller: LockController) => Promise<void> | void;

export interface LockController {
  readonly lost: boolean;
  release(): Promise<void>;
}

export interface Lock {
  acquire(): Promise<LockController | false>;
  acquire(timeout: number): Promise<LockController | false>;
  acquire(func: LockedFunction): Promise<LockController | false>;
  acquire(timeout: number, func: LockedFunction): Promise<LockController | false>;

  exists(): Promise<boolean>;
}
