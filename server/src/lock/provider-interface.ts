import { ILock } from './';

export interface ILockProvider {
  getLock(key: string): ILock;
}
