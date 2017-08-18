export interface ILock {
  lock(time?: number): Promise<boolean>;
  unlock(): Promise<boolean>;
  haslock(): Promise<boolean>;
}
