import { Lock } from './';

export interface LockProvider {
  get(key: string): Lock;
}
