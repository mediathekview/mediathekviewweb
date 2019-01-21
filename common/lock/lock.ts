export type LockedFunction = (controller: LockController) => Promise<void> | void;

export interface LockController {
  readonly lost: boolean;
  release(): Promise<void>;
}

export interface Lock {
  acquire(timeout: number, func?: LockedFunction): Promise<LockController | false>;

  exists(): Promise<boolean>;
}
