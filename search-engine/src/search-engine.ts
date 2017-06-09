import { Query } from '../model';

export interface State {
  indexedItems: number;
  lastChange: number;
}

export interface ISearchEngine<T> {
  index(...items: T[]): Promise<void>;
  state(): Promise<State>;
}
