import { Lock } from './lock';

export interface LockProvider {
  get(key: string): Lock;
}
