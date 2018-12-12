import { Entry } from './entry';

export type StreamInfo<T> = {
  length: number,
  radixTreeKeys: number,
  radixTreeNodes: number,
  groups: number,
  lastGeneratedId: string,
  firstEntry: Entry<T>,
  lastEntry: Entry<T>
};
